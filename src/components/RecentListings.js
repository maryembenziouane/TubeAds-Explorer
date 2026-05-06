/**
 * Marketplace listings grid — read-only browsing of `annonces` with client
 * search filtering. Wired to Firebase via `listenAds`; video playback is
 * delegated to `onPlay(ad)` → `VideoPlayerModal` in App.
 */
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ANNONCES_COLLECTION, adMatchesSelectedCategory, listenAds } from '../services/listings';
import { listenFavoriteIds } from '../services/favorites';
import AdCard from './AdCard';

export default function RecentListings({
  searchQuery = '',
  category = null,
  onRequireLogin,
  onPlay,
  onEdit,
}) {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [favIds, setFavIds] = useState(() => new Set());

  useEffect(() => {
    setStatus('loading');
    const off = listenAds(
      { max: 72 },
      (items) => {
        setAds(items);
        setStatus('ready');
        setError(null);
      },
      (err) => {
        setError(err);
        setStatus('error');
      },
    );
    return off;
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Ads received:', ads);
  }, [ads]);

  useEffect(() => {
    if (!user) {
      setFavIds(new Set());
      return undefined;
    }
    return listenFavoriteIds(user.uid, setFavIds, (err) =>
      console.warn('favorites listener', err),
    );
  }, [user]);

  const filtered = useMemo(() => {
    const byCategory = category
      ? ads.filter((ad) => adMatchesSelectedCategory(ad, category))
      : ads;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter((ad) =>
      [ad.title, ad.description, ad.category, ad.city]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [ads, searchQuery, category]);

  return (
    <section id="recent-listings" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[1.35rem]">
          Recent listings
        </h2>
        <p className="text-xs text-slate-500 tabular-nums">
          {status === 'ready' && (
            <>
              {filtered.length} shown
              {ads.length !== filtered.length ? ` · ${ads.length} from feed` : null}
            </>
          )}
        </p>
      </div>

      {status === 'loading' && <SkeletonGrid />}
      {status === 'error' && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Could not load listings. Confirm Firestore rules allow read on{' '}
          <code className="font-mono text-xs">{ANNONCES_COLLECTION}</code>.{' '}
          {error?.message || ''}
        </div>
      )}
      {status === 'ready' && filtered.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-600">
          {searchQuery.trim()
            ? 'No listings match your search.'
            : category
              ? 'No listings match this category.'
              : 'No listings loaded from Firestore.'}
        </div>
      )}
      {status === 'ready' && filtered.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, 60).map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              isFavorite={favIds.has(ad.id)}
              onRequireLogin={onRequireLogin}
              onPlay={onPlay}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-slate-100" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-[92%] animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
