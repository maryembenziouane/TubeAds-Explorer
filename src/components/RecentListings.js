/**
 * Marketplace listings grid — read-only browsing of `annonces` with client
 * search filtering. Wired to Firebase via `listenAds`; video playback is
 * delegated to `onPlay(ad)` → `VideoPlayerModal` in App.
 */
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSellerProfiles } from '../hooks/useSellerProfiles';
import { ANNONCES_COLLECTION, adIsVisibleOnPublicHome, adMatchesSelectedCategory, listenAds } from '../services/listings';
import { listenFavoriteIds } from '../services/favorites';
import AdCard from './AdCard';
import { PopularNowSidebar, TopSellersSidebar } from './HomeListingSidebars';

export default function RecentListings({
  searchQuery = '',
  category = null,
  onRequireLogin,
  onPlay,
  onEdit,
  onVisitShop,
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

  const publishedAds = useMemo(() => ads.filter(adIsVisibleOnPublicHome), [ads]);

  const ownerUidList = useMemo(() => publishedAds.map((a) => a.ownerUid), [publishedAds]);
  const sellerProfiles = useSellerProfiles(ownerUidList);

  const filtered = useMemo(() => {
    const byCategory = category
      ? publishedAds.filter((ad) => adMatchesSelectedCategory(ad, category))
      : publishedAds;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter((ad) =>
      [ad.title, ad.description, ad.category, ad.city]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [publishedAds, searchQuery, category]);

  return (
    <section id="recent-listings" className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-10 lg:mb-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Annonces récentes
        </h2>
        <p className="mt-2 text-sm text-slate-500 tabular-nums">
          {status === 'ready' && (
            <>
              {filtered.length} annonce{filtered.length !== 1 ? 's' : ''} affichée
              {filtered.length !== 1 ? 's' : ''}
              {publishedAds.length !== filtered.length
                ? ` · ${publishedAds.length} publiée${publishedAds.length !== 1 ? 's' : ''}`
                : null}
              {ads.length !== publishedAds.length ? ` · ${ads.length} dans le flux` : null}
            </>
          )}
        </p>
      </header>

      {status === 'loading' && <SkeletonGrid />}

      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Could not load listings. Confirm Firestore rules allow read on{' '}
          <code className="font-mono text-xs">{ANNONCES_COLLECTION}</code>.{' '}
          {error?.message || ''}
        </div>
      )}

      {status === 'ready' && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-600">
          {searchQuery.trim()
            ? 'Aucune annonce ne correspond à votre recherche.'
            : category
              ? 'Aucune annonce dans cette catégorie.'
              : ads.length === 0
                ? 'Aucune annonce chargée depuis Firestore.'
                : 'Aucune annonce publiée pour le moment. Les annonces en attente doivent être approuvées dans l’admin.'}
        </div>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-12">
          <div className="min-w-0 lg:col-span-8">
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 60).map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  isFavorite={favIds.has(ad.id)}
                  onRequireLogin={onRequireLogin}
                  onPlay={onPlay}
                  onEdit={onEdit}
                  sellerProfile={sellerProfiles[ad.ownerUid]}
                  onVisitShop={onVisitShop}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-4 lg:sticky lg:top-24">
            <PopularNowSidebar ads={publishedAds} onPlay={onPlay} />
            <TopSellersSidebar
              ads={publishedAds}
              sellerProfiles={sellerProfiles}
              onVisitShop={onVisitShop}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-8">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-2 xl:grid-cols-3">
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
      </div>
      <div className="hidden lg:col-span-4 lg:block">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-8 h-56 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
