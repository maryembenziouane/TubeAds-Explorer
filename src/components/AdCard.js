/**
 * Listing card — video-centric: YouTube-backed thumbnail (`annonces` doc),
 * tap opens the modal player (read-only browsing). Heart syncs with mobile
 * favorites.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toggleFavorite } from '../services/favorites';
import { cityLabel } from '../services/categories';
import { Icon } from './Icons';

const CURRENCY_SUFFIX = { MAD: 'MAD', EUR: '€', USD: '$' };

function formatPrice(priceCents, currency = 'MAD') {
  if (typeof priceCents !== 'number' || Number.isNaN(priceCents)) return '—';
  const amount = priceCents / 100;
  const grouped = Math.round(amount).toLocaleString('fr-FR');
  const suffix = CURRENCY_SUFFIX[currency] || currency;
  return currency === 'MAD' ? `${grouped} ${suffix}` : `${suffix}${grouped}`;
}

function tsMs(ts) {
  if (!ts) return null;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  return null;
}

function relativeTime(ts) {
  const ms = tsMs(ts);
  if (ms == null) return '';
  const minutes = Math.round((Date.now() - ms) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const h = Math.round(minutes / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d} d ago`;
  return `${Math.round(d / 7)} w ago`;
}

const NEW_MS = 7 * 86400000;
function hasNewBadge(ts) {
  const ms = tsMs(ts);
  return ms != null && Date.now() - ms < NEW_MS;
}

export default function AdCard({ ad, isFavorite, onRequireLogin, onPlay }) {
  const { user } = useAuth();
  const [heartBusy, setHeartBusy] = useState(false);
  const hasVideo = Boolean(ad.youtubeVideoId) || Boolean(ad.videoUrl);
  const isDirectVideo =
    typeof ad.videoUrl === 'string' &&
    (/\.(mp4|webm|ogg)(\?|#|$)/i.test(ad.videoUrl) ||
      ad.videoUrl.includes('firebasestorage') ||
      ad.videoUrl.includes('storage.googleapis'));

  async function onFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      onRequireLogin?.();
      return;
    }
    if (heartBusy) return;
    setHeartBusy(true);
    try {
      await toggleFavorite(ad, !!isFavorite);
    } finally {
      setHeartBusy(false);
    }
  }

  return (
    <article className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:z-[1] hover:-translate-y-0.5 hover:shadow-lg">
      <button
        type="button"
        className="relative block w-full overflow-hidden rounded-t-2xl text-left outline-none ring-inset focus-visible:ring-2 focus-visible:ring-brand-400"
        onClick={() => onPlay?.(ad)}
      >
        <div className="relative aspect-[4/3] w-full bg-slate-50">
          {isDirectVideo ? (
            <video
              src={ad.videoUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
              poster={ad.thumbnailUrl || undefined}
            />
          ) : ad.thumbnailUrl ? (
            <img
              src={ad.thumbnailUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              No preview
            </div>
          )}

          {hasVideo && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/95 text-brand-500 shadow-lg ring-1 ring-black/5 transition group-hover:scale-105">
                <Icon name="play" className="ml-0.5 h-6 w-6" />
              </span>
            </span>
          )}

          {hasNewBadge(ad.createdAt) && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-brand-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow">
              New
            </span>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={onFavorite}
        aria-pressed={isFavorite}
        aria-label="Favorite"
        className={
          'absolute right-2.5 top-2.5 grid h-10 w-10 place-items-center rounded-full border border-black/5 bg-white shadow-md backdrop-blur transition hover:scale-105 ' +
          (isFavorite ? 'text-brand-500' : 'text-slate-600')
        }
      >
        <Icon name={isFavorite ? 'heartFilled' : 'heart'} className="h-5 w-5" />
      </button>

      <div className="space-y-1.5 p-4">
        <div className="text-lg font-extrabold text-brand-500">
          {formatPrice(ad.priceCents, ad.currency)}
        </div>
        <h3 className="line-clamp-2 min-h-[2.65rem] text-[15px] font-semibold leading-snug text-slate-900">
          {ad.title || 'Untitled'}
        </h3>
        <div className="flex flex-wrap items-center gap-x-1 text-xs font-medium text-slate-500">
          <Icon name="pin" className="h-3.5 w-3.5 shrink-0 opacity-75" />
          <span>{cityLabel(ad.city) || '—'}</span>
          <span className="text-slate-300" aria-hidden>
            •
          </span>
          <span>{relativeTime(ad.createdAt) || 'recent'}</span>
        </div>
      </div>
    </article>
  );
}
