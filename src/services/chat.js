// Chat threads — same `chatThreads` collection + `messages` subcollection
// used by VideoUploadApp/src/services/commerceFirestore.ts.
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const CHAT_THREADS = 'chatThreads';

const threadsCol = () => collection(db, CHAT_THREADS);
const messagesCol = (threadId) =>
  collection(db, CHAT_THREADS, threadId, 'messages');

function requireUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('You must be signed in.');
  return uid;
}

export function listenChatThreads(uid, onChange, onError) {
  const q = query(
    threadsCol(),
    where('participantIds', 'array-contains', uid),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => onError && onError(err),
  );
}

export function listenThreadMessages(threadId, onChange, onError) {
  const q = query(messagesCol(threadId), orderBy('createdAt', 'asc'), limit(200));
  return onSnapshot(
    q,
    (snap) =>
      onChange(snap.docs.map((d) => ({ id: d.id, threadId, ...d.data() }))),
    (err) => onError && onError(err),
  );
}

export async function sendChatMessage(threadId, text, imageUrl = null) {
  const uid = requireUid();
  const trimmed = (text || '').trim();
  if (!trimmed && !imageUrl) return;
  const now = serverTimestamp();
  const msgRef = doc(messagesCol(threadId));
  const batch = writeBatch(db);
  batch.set(msgRef, {
    senderUid: uid,
    text: trimmed || (imageUrl ? ' ' : ''),
    imageUrl,
    createdAt: now,
  });
  batch.set(
    doc(threadsCol(), threadId),
    {
      lastMessageText: trimmed || '📷 Photo',
      lastMessageAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
  await batch.commit();
}

/**
 * Find or create a chat thread for an ad, on behalf of the current user (buyer).
 * Mirrors `ensureChatThreadForOrder` from the mobile codebase so threads are
 * deduped across platforms.
 */
export async function getOrCreateChatThreadForAd(ad) {
  const buyerUid = requireUid();
  if (ad.ownerUid === buyerUid) {
    throw new Error('You cannot message yourself on your own listing.');
  }
  const existingSnap = await getDocs(
    query(
      threadsCol(),
      where('adId', '==', ad.id),
      where('buyerUid', '==', buyerUid),
      limit(1),
    ),
  );
  if (!existingSnap.empty) return existingSnap.docs[0].id;

  const participants = [buyerUid, ad.ownerUid].sort();
  const ref = await addDoc(threadsCol(), {
    adId: ad.id,
    buyerUid,
    sellerUid: ad.ownerUid,
    participantIds: participants,
    productTitle: ad.title,
    productThumb: ad.thumbnailUrl,
    priceLabel: `${Math.round((ad.priceCents || 0) / 100)} ${ad.currency || 'MAD'}`,
    lastMessageText: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}
