/**
 * User profiles in Firestore `users/{uid}` — shared with mobile.
 * Compte Pro: `isPro: boolean`
 * Boutique: `shopName`, `shopLogoUrl`, `shopDescription`
 */
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const USERS_COLLECTION = 'users';

export function normalizeUserProfile(uid, raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      uid,
      isPro: false,
      shopName: '',
      shopLogoUrl: '',
      shopDescription: '',
    };
  }
  return {
    uid,
    isPro: Boolean(raw.isPro),
    shopName: String(raw.shopName ?? raw.shop_name ?? raw.displayName ?? '').trim(),
    shopLogoUrl: String(raw.shopLogoUrl ?? raw.shop_logo_url ?? raw.photoURL ?? '').trim(),
    shopDescription: String(
      raw.shopDescription ?? raw.shop_description ?? raw.bio ?? raw.about ?? '',
    ).trim(),
  };
}

export function subscribeUser(uid, onChange, onError) {
  if (!uid) {
    onChange(normalizeUserProfile('', null));
    return () => {};
  }
  return onSnapshot(
    doc(db, USERS_COLLECTION, uid),
    (snap) => {
      if (!snap.exists()) onChange(normalizeUserProfile(uid, null));
      else onChange(normalizeUserProfile(uid, snap.data()));
    },
    (err) => onError?.(err),
  );
}
