// Read-only Marketplace feed — `annonces` collection from the Firebase project
// shared with the React Native Video Ads app (`src/firebase.js` → Firestore db).
//
// Real-time via a single collection subscription (no redundant duplicate
// listeners). Field coercion in `parseAd` keeps web + mobile payloads aligned
// (youtubeVideoId, videoUrl, camelCase/snake_case, etc.).
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';
import { categoryFirestoreValue } from './categories';

/** Collection ID used by the mobile home feed (must match Firebase). */
export const ANNONCES_COLLECTION = 'annonces';
// Keep web in lockstep with the mobile app: read from the exact same collection.
// If you ever discover the app is writing to a different collection, change
// this constant (and only this constant).
export const FALLBACK_COLLECTIONS = [];

// Debug helper so we don't spam the console with thousands of logs.
let __parseDebugCount = 0;

function normCat(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
}

function adMatchesSelectedCategory(ad, selectedTileId) {
  if (!selectedTileId) return true;
  const stored = normCat(ad.category);
  const fromTileId = normCat(categoryFirestoreValue(selectedTileId));
  const slug = normCat(selectedTileId.replace(/-/g, ' '));
  return stored === fromTileId || stored === slug || stored === normCat(selectedTileId);
}

/** Strip a bare YouTube ID or parse one from youtube.com / youtu.be URLs. */
function extractYoutubeVideoId(candidate) {
  if (!candidate || typeof candidate !== 'string') return '';
  const trimmed = candidate.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const embedded = trimmed.match(/(?:youtube\.com\/(?:embed\/|live\/|shorts\/|watch\?(?:.*?&)?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (embedded?.[1]) return embedded[1];
  const watch = trimmed.match(/\bv=([a-zA-Z0-9_-]{11})\b/);
  return watch?.[1] || '';
}

/**
 * Hydrate a Firestore `annonces` document into the canonical `Ad` shape.
 * Mirrors mobile fields: title, price, category, thumbnail, youtubeVideoId /
 * videoUrl, etc.
 */
export function parseAd(id, raw) {
  // DEBUG: Inspect the exact Firestore document shape coming from mobile.
  // Only log a few docs to keep the console readable.
  if (process.env.NODE_ENV !== 'production' && __parseDebugCount < 10) {
    __parseDebugCount += 1;
    // eslint-disable-next-line no-console
    console.log('Raw data from Firestore:', raw);
  }

  const rawVideoUrl =
    (typeof raw.videoUrl === 'string' && raw.videoUrl) ||
    (typeof raw.video_url === 'string' && raw.video_url) ||
    '';

  const fromUrlFields = [
    rawVideoUrl,
    raw.youtubeUrl,
    raw.youtube_url,
  ]
    .map((v) => (typeof v === 'string' ? extractYoutubeVideoId(v) : ''))
    .find(Boolean);

  const yt =
    (typeof raw.youtubeVideoId === 'string' &&
      extractYoutubeVideoId(raw.youtubeVideoId || '')) ||
    (typeof raw.youtube_video_id === 'string' &&
      extractYoutubeVideoId(raw.youtube_video_id || '')) ||
    (typeof raw.videoId === 'string' &&
      extractYoutubeVideoId(raw.videoId || '')) ||
    (typeof raw.video_id === 'string' &&
      extractYoutubeVideoId(raw.video_id || '')) ||
    fromUrlFields ||
    '';

  const thumbnailUrl =
    (typeof raw.thumbnailUrl === 'string' && raw.thumbnailUrl) ||
    (typeof raw.thumbnail_url === 'string' && raw.thumbnail_url) ||
    (typeof raw.imageUrl === 'string' && raw.imageUrl) ||
    (typeof raw.image_url === 'string' && raw.image_url) ||
    (Array.isArray(raw.images) && typeof raw.images[0] === 'string' && raw.images[0]) ||
    (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : '');

  return {
    id,
    title: String(raw.title ?? raw.name ?? ''),
    description: String(raw.description ?? ''),
    priceCents:
      typeof raw.priceCents === 'number'
        ? raw.priceCents
        : typeof raw.price_cents === 'number'
          ? raw.price_cents
          : typeof raw.price === 'number'
            ? Math.round(raw.price * 100)
            : 0,
    currency: raw.currency || 'MAD',
    category: String(raw.category ?? ''),
    city: String(raw.city ?? ''),
    youtubeVideoId: yt,
    // Keep a direct file URL if the mobile app stores one (mp4 / storage),
    // otherwise synthesize a watch URL from the YouTube id.
    videoUrl:
      rawVideoUrl ||
      (yt ? `https://www.youtube.com/watch?v=${yt}` : ''),
    thumbnailUrl,
    ownerUid: String(
      raw.ownerUid ?? raw.owner_uid ?? raw.userId ?? raw.user_id ?? '',
    ),
    status: raw.status ?? 'active',
    createdAt:
      raw.createdAt ?? raw.created_at ?? raw.timestamp ?? raw.date ?? null,
  };
}

function timestampMs(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  return 0;
}

/** Live feed sorted newest-first. Read-only browse — no uploads on web. */
export function listenAds({ category, max = 60 } = {}, onChange, onError) {
  return onSnapshot(
    query(collection(db, ANNONCES_COLLECTION)),
    (snapshot) => {
      const items = snapshot.docs.map((d) => parseAd(d.id, d.data()));
      items.sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt));
      // TEMP DEBUG: show *every* doc returned by the collection subscription.
      // No Firestore where() clauses, and no client-side category filtering.
      onChange(items.slice(0, max));
    },
    (err) => {
      // eslint-disable-next-line no-console
      console.error(`[${ANNONCES_COLLECTION}]`, err);
      onError?.(err);
    },
  );
}

export async function getAd(adId) {
  const snap = await getDoc(doc(db, ANNONCES_COLLECTION, adId));
  if (!snap.exists()) return null;
  return parseAd(snap.id, snap.data());
}

export function listenMyAds(uid, onChange, onError) {
  return onSnapshot(
    query(collection(db, ANNONCES_COLLECTION)),
    (snap) => {
      const mine = snap.docs
        .map((d) => parseAd(d.id, d.data()))
        .filter((ad) => ad.ownerUid === uid);
      mine.sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt));
      onChange(mine);
    },
    (err) => onError?.(err),
  );
}
