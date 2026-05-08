/**
 * Marketplace listings grid — read-only browsing of `annonces` with client
 * search filtering. Wired to Firebase via `listenAds`; video playback is
 * delegated to `onPlay(ad)` → `VideoPlayerModal` in App.
 */
import { useEffect, useMemo, useState } from 'react';
import { SITE_GUTTER_CLASS, SITE_MAX_WIDTH_CLASS } from '../constants/layout';
import { useAuth } from '../context/AuthContext';
import { useSellerProfiles } from '../hooks/useSellerProfiles';
import {
  ANNONCES_COLLECTION,
  adIsVisibleOnPublicHome,
  adMatchesCity,
  adMatchesSelectedCategory,
  listenAds,
} from '../services/listings';
import { listenFavoriteIds } from '../services/favorites';
import AdCard from './AdCard';
import PopularNowSidebar from './sidebars/PopularNowSidebar';
import TopSellersSidebar from './sidebars/TopSellersSidebar';

export default function RecentListings({
  searchQuery = '',
  category = null,
  cityFilter = null,
  onRequireLogin,
  onPlay,
  onEdit,
  onVisitShop,
  previewLimit = null,
  onViewAll,
  showSectionTitle = true,
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
    const byCity = byCategory.filter((ad) => adMatchesCity(ad, cityFilter));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byCity;
    return byCity.filter((ad) =>
      [ad.title, ad.description, ad.category, ad.city]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [publishedAds, searchQuery, category, cityFilter]);

  const cappedList = useMemo(() => {
    const limit =
      typeof previewLimit === 'number' && previewLimit > 0 ? previewLimit : null;
    const maxAll = 60;
    if (limit) return filtered.slice(0, limit);
    return filtered.slice(0, maxAll);
  }, [filtered, previewLimit]);

  const isHomePreview =
    typeof previewLimit === 'number' && previewLimit > 0;

  const hasMoreThanPreview =
    typeof previewLimit === 'number' && previewLimit > 0 && filtered.length > previewLimit;

  const showVoirTout = isHomePreview && onViewAll;

  /** Accueil : 3 annonces sur une ligne + sidebar widgets à droite (empilés). */
  const singleRowHome =
    typeof previewLimit === 'number' && previewLimit > 0 && previewLimit <= 3;

  const gridClass =
    'grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  const homeAdsRowClass =
    'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-flow-row lg:grid-cols-3 lg:gap-3 lg:overflow-visible lg:snap-none';

  const shellPad =
    `${SITE_MAX_WIDTH_CLASS} ${SITE_GUTTER_CLASS} mx-auto ` +
    (showSectionTitle ? 'py-14 lg:py-16' : 'pb-14 pt-2 lg:pb-16 lg:pt-4');

  return (
    <section id="recent-listings" className={shellPad}>
      {showSectionTitle && (
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 lg:mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Annonces récentes
            </h2>
            <p className="mt-2 text-sm text-slate-500 tabular-nums">
              {status === 'ready' && !isHomePreview && (
                <>
                  {cappedList.length} annonce{cappedList.length !== 1 ? 's' : ''} affichée
                  {cappedList.length !== 1 ? 's' : ''}
                  {hasMoreThanPreview ? ` sur ${filtered.length}` : null}
                </>
              )}
            </p>
          </div>
          {showVoirTout && (
            <button
              type="button"
              onClick={() => onViewAll()}
              className="shrink-0 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Voir tout
            </button>
          )}
        </header>
      )}

      {status === 'loading' && <SkeletonGrid compactHome={singleRowHome} />}

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
        <div
          className={
            singleRowHome
              ? 'grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-6'
              : 'grid grid-cols-1 items-start gap-8 lg:grid-cols-12'
          }
        >
          <div className={singleRowHome ? 'min-w-0 lg:col-span-8' : 'min-w-0 lg:col-span-8'}>
            <div className={singleRowHome ? homeAdsRowClass : gridClass}>
              {cappedList.map((ad) => (
                <div
                  key={ad.id}
                  className={
                    singleRowHome
                      ? 'min-w-[min(82vw,272px)] shrink-0 snap-start lg:min-w-0 lg:shrink'
                      : undefined
                  }
                >
                  <AdCard
                    ad={ad}
                    isFavorite={favIds.has(ad.id)}
                    onRequireLogin={onRequireLogin}
                    onPlay={onPlay}
                    onEdit={onEdit}
                    sellerProfile={sellerProfiles[ad.ownerUid]}
                    onVisitShop={onVisitShop}
                    density={singleRowHome ? 'compact' : 'default'}
                  />
                </div>
              ))}
            </div>
          </div>
          {singleRowHome ? (
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">
              <PopularNowSidebar ads={publishedAds} onPlay={onPlay} onViewAll={onViewAll} />
              <TopSellersSidebar
                ads={publishedAds}
                sellerProfiles={sellerProfiles}
                onVisitShop={onVisitShop}
                onViewAll={onViewAll}
              />
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">
              <PopularNowSidebar ads={publishedAds} onPlay={onPlay} onViewAll={onViewAll} />
              <TopSellersSidebar
                ads={publishedAds}
                sellerProfiles={sellerProfiles}
                onVisitShop={onVisitShop}
                onViewAll={onViewAll}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SkeletonGrid({ compactHome }) {
  return (
    <div
      className={
        compactHome
          ? 'grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-6 xl:gap-8'
          : 'grid grid-cols-1 items-start gap-8 lg:grid-cols-12'
      }
    >
      <div className={compactHome ? 'min-w-0 lg:col-span-9' : 'min-w-0 lg:col-span-8'}>
        <div
          className={
            compactHome
              ? 'flex gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:gap-3 lg:overflow-visible'
              : 'grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }
        >
          {Array.from({ length: compactHome ? 3 : 8 }).map((_, i) => (
            <div
              key={i}
              className={
                compactHome
                  ? 'min-w-[min(82vw,272px)] shrink-0 lg:min-w-0'
                  : undefined
              }
            >
              <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
                <div className="aspect-[4/3] animate-pulse bg-slate-100" />
                <div className="space-y-2 p-4">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-[92%] animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {compactHome ? (
        <div className="hidden min-w-0 flex-col gap-5 lg:col-span-3 lg:flex">
          <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : (
        <div className="hidden flex-col gap-6 lg:col-span-4 lg:flex">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      )}
    </div>
  );
}
