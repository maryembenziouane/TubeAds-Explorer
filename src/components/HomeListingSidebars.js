/**
 * Compact side rails for the home feed — uses the same published ad list as the
 * main grid (no extra Firestore reads).
 */
import { useMemo } from 'react';
import { Icon } from './Icons';

function tsMs(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  return 0;
}

function formatPriceCompact(priceCents, currency = 'MAD') {
  if (typeof priceCents !== 'number' || Number.isNaN(priceCents)) return '—';
  const amount = Math.round(priceCents / 100).toLocaleString('fr-FR');
  return currency === 'MAD' ? `${amount} MAD` : `${amount} ${currency}`;
}

export function PopularNowSidebar({ ads, onPlay }) {
  const items = useMemo(() => {
    const sorted = [...ads].sort((a, b) => tsMs(b.createdAt) - tsMs(a.createdAt));
    return sorted.slice(0, 6);
  }, [ads]);

  if (items.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon name="tag" className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-extrabold tracking-tight text-slate-900">
          Populaires en ce moment
        </h3>
      </div>
      <ul className="space-y-1">
        {items.map((ad) => (
          <li key={ad.id}>
            <button
              type="button"
              onClick={() => onPlay?.(ad)}
              className="flex w-full gap-3 rounded-xl p-2 text-left transition hover:bg-slate-50"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {ad.thumbnailUrl ? (
                  <img src={ad.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    —
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1 py-0.5">
                <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900">
                  {ad.title || 'Sans titre'}
                </span>
                <span className="mt-0.5 block text-xs font-bold text-brand-600">
                  {formatPriceCompact(ad.priceCents, ad.currency)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function TopSellersSidebar({ ads, sellerProfiles, onVisitShop }) {
  const rows = useMemo(() => {
    const counts = new Map();
    for (const ad of ads) {
      const uid = ad.ownerUid;
      if (!uid) continue;
      counts.set(uid, (counts.get(uid) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([ownerUid, count]) => ({ ownerUid, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [ads]);

  if (rows.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
          <Icon name="user" className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-extrabold tracking-tight text-slate-900">Top vendeurs</h3>
      </div>
      <ul className="space-y-2">
        {rows.map(({ ownerUid, count }) => {
          const prof = sellerProfiles[ownerUid];
          const name =
            prof?.shopName?.trim() ||
            `Boutique ${String(ownerUid).slice(0, 6)}…`;
          const logo = prof?.shopLogoUrl;
          return (
            <li key={ownerUid}>
              <button
                type="button"
                onClick={() => onVisitShop?.(ownerUid)}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition hover:border-slate-100 hover:bg-slate-50"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-600 ring-1 ring-slate-200/80">
                  {logo ? (
                    <img src={logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    name.slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-slate-900">
                    {name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {count} annonce{count > 1 ? 's' : ''}
                  </span>
                </span>
                <Icon name="chevronDown" className="-rotate-90 h-4 w-4 shrink-0 text-slate-400" />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
