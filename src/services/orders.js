// Orders read layer. Same `orders` collection the React Native app writes to
// via VideoUploadApp/src/services/commerceFirestore.ts — so when a buyer taps
// "Buy" on mobile, the seller sees it appear here in real time.
//
// Order doc shape (see VideoUploadApp/src/types/Commerce.ts):
//   { buyerUid, sellerUid, adId, adTitle, adThumbnailUrl,
//     priceCents, currency, delivery: {...}, deliveryMethod, paymentMethod,
//     status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled',
//     orderNumber, subtotalCents, shippingFeeCents, totalCents,
//     createdAt, updatedAt }
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const ORDERS = 'orders';

const STATUS_FALLBACK = {
  Pending: 'Pending',
  'In Progress': 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  // Legacy lowercase values from older mobile builds.
  pending: 'Pending',
  confirmed: 'In Progress',
  preparing: 'In Progress',
  shipping: 'In Progress',
  delivered: 'Completed',
  cancelled: 'Cancelled',
};

export function normalizeOrderStatus(raw) {
  return STATUS_FALLBACK[String(raw ?? '').trim()] || 'Pending';
}

function parseOrder(id, raw) {
  const priceCents = Number(raw.priceCents) || 0;
  const subtotalCents = Number(raw.subtotalCents ?? raw.priceCents) || priceCents;
  const shippingFeeCents = Number(raw.shippingFeeCents ?? 0) || 0;
  const totalCents =
    Number(raw.totalCents ?? subtotalCents + shippingFeeCents) || subtotalCents + shippingFeeCents;
  return {
    id,
    buyerUid: String(raw.buyerUid ?? ''),
    sellerUid: String(raw.sellerUid ?? ''),
    adId: String(raw.adId ?? ''),
    adTitle: String(raw.adTitle ?? ''),
    adThumbnailUrl: String(raw.adThumbnailUrl ?? ''),
    priceCents,
    currency: raw.currency || 'MAD',
    delivery: raw.delivery || {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      zip: '',
    },
    deliveryMethod: raw.deliveryMethod || 'home',
    paymentMethod: raw.paymentMethod || 'cash',
    status: normalizeOrderStatus(raw.status),
    orderNumber: String(raw.orderNumber || `ORD-${id.slice(-6).toUpperCase()}`),
    subtotalCents,
    shippingFeeCents,
    totalCents,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

function requireUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('You must be signed in.');
  return uid;
}

/**
 * Live feed of orders **received** by the current seller. Mirrors mobile
 * `listenSellerOrders`. Composite index needed: `sellerUid` + `createdAt` desc.
 */
export function listenSellerOrders(uid, onChange, onError) {
  const q = query(
    collection(db, ORDERS),
    where('sellerUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(100),
  );
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => parseOrder(d.id, d.data()))),
    (err) => onError && onError(err),
  );
}

/**
 * Live feed of orders **placed** by the current buyer. Available for future
 * use (e.g. an "Orders I placed" tab). Same query mobile `listenBuyerOrders`
 * uses. Composite index needed: `buyerUid` + `createdAt` desc.
 */
export function listenBuyerOrders(uid, onChange, onError) {
  const q = query(
    collection(db, ORDERS),
    where('buyerUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(100),
  );
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => parseOrder(d.id, d.data()))),
    (err) => onError && onError(err),
  );
}

/**
 * Seller-only status transitions. Same allowed transitions as the mobile
 * `sellerAdvanceOrder`: Pending → In Progress (confirm), In Progress → Completed
 * (mark shipped). The Firestore rules on the mobile side already gate this by
 * sellerUid; we still check on the client to fail fast with a clear message.
 */
export async function sellerAdvanceOrder(order, action) {
  const uid = requireUid();
  if (order.sellerUid !== uid) {
    throw new Error('Only the seller can update this order.');
  }
  if (action === 'confirm' && order.status !== 'Pending') {
    throw new Error('Only pending orders can be confirmed.');
  }
  if (action === 'mark_shipped' && order.status !== 'In Progress') {
    throw new Error('Only in-progress orders can be marked shipped.');
  }
  const nextStatus = action === 'confirm' ? 'In Progress' : 'Completed';
  await updateDoc(doc(db, ORDERS, order.id), {
    status: nextStatus,
    updatedAt: serverTimestamp(),
  });
}

/** Cancel a pending order (seller side). Buyer-side cancel can be added later. */
export async function sellerCancelOrder(order) {
  const uid = requireUid();
  if (order.sellerUid !== uid) {
    throw new Error('Only the seller can cancel this order.');
  }
  if (order.status === 'Completed' || order.status === 'Cancelled') {
    throw new Error('This order can no longer be cancelled.');
  }
  await updateDoc(doc(db, ORDERS, order.id), {
    status: 'Cancelled',
    updatedAt: serverTimestamp(),
  });
}
