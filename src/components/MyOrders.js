// "My Orders" / Commandes — seller dashboard.
//
// Two real-time sections, both backed by the same Firestore collections the
// React Native app uses:
//   1. Ads I posted        → `listings` where ownerUid == uid
//   2. Orders from buyers  → `orders`   where sellerUid == uid
//
// When a buyer taps "Buy" on the mobile app, `commerceFirestore.createOrderFromCheckout`
// adds a doc to `orders` with our uid as `sellerUid` — the listener below picks
// it up and the "Orders received" panel updates instantly.
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listenMyAds } from '../services/listings';
import {
  listenSellerOrders,
  sellerAdvanceOrder,
  sellerCancelOrder,
} from '../services/orders';
import { cityLabel, categoryLabel } from '../services/categories';
import { Icon } from './Icons';

const TABS = [
  { id: 'orders', label: 'Orders received' },
  { id: 'ads', label: 'My ads' },
];

const CURRENCY_SUFFIX = { MAD: 'MAD', EUR: '€', USD: '$' };

function formatPrice(priceCents, currency = 'MAD') {
  const amount = (Number(priceCents) || 0) / 100;
  const grouped = Math.round(amount).toLocaleString('fr-FR');
  const suffix = CURRENCY_SUFFIX[currency] || currency;
  return currency === 'MAD' ? `${grouped} ${suffix}` : `${suffix}${grouped}`;
}

function formatDateTime(ts) {
  if (!ts) return '';
  let ms = null;
  if (typeof ts.toMillis === 'function') ms = ts.toMillis();
  else if (typeof ts.seconds === 'number') ms = ts.seconds * 1000;
  if (ms == null) return '';
  return new Date(ms).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_TONE = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-sky-50 text-sky-700 border-sky-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function MyOrders({ onRequireLogin }) {
  const { user, ready } = useAuth();
  const [tab, setTab] = useState('orders');

  const [orders, setOrders] = useState([]);
  const [ordersStatus, setOrdersStatus] = useState('loading');
  const [ordersError, setOrdersError] = useState(null);

  const [ads, setAds] = useState([]);
  const [adsStatus, setAdsStatus] = useState('loading');
  const [adsError, setAdsError] = useState(null);

  // If we're hydrated and there's no user, prompt to log in once.
  useEffect(() => {
    if (ready && !user) onRequireLogin?.();
  }, [ready, user, onRequireLogin]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersStatus('ready');
      return undefined;
    }
    setOrdersStatus('loading');
    return listenSellerOrders(
      user.uid,
      (list) => {
        setOrders(list);
        setOrdersStatus('ready');
      },
      (err) => {
        setOrdersError(err);
        setOrdersStatus('error');
      },
    );
  }, [user]);

  useEffect(() => {
    if (!user) {
      setAds([]);
      setAdsStatus('ready');
      return undefined;
    }
    setAdsStatus('loading');
    return listenMyAds(
      user.uid,
      (list) => {
        setAds(list);
        setAdsStatus('ready');
      },
      (err) => {
        setAdsError(err);
        setAdsStatus('error');
      },
    );
  }, [user]);

  const counts = useMemo(
    () => ({
      orders: orders.filter((o) => o.status !== 'Cancelled').length,
      ads: ads.filter((a) => a.status !== 'hidden').length,
    }),
    [orders, ads],
  );

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-slate-500 mt-2">
          Sign in to see ads you've posted and orders from buyers.
        </p>
        <button
          type="button"
          onClick={onRequireLogin}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 text-sm transition"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Orders
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Commandes — synced live with your mobile app.
          </p>
        </div>
      </header>

      <nav
        className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm shadow-sm"
        role="tablist"
        aria-label="My Orders sections"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={
                'px-4 py-1.5 rounded-full font-medium transition ' +
                (active
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-slate-700 hover:text-slate-900')
              }
            >
              {t.label}
              <span
                className={
                  'ml-2 rounded-full px-2 py-0.5 text-[11px] ' +
                  (active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')
                }
              >
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </nav>

      {tab === 'orders' && (
        <OrdersSection
          status={ordersStatus}
          error={ordersError}
          orders={orders}
        />
      )}

      {tab === 'ads' && (
        <AdsSection status={adsStatus} error={adsError} ads={ads} />
      )}
    </div>
  );
}

function OrdersSection({ status, error, orders }) {
  if (status === 'loading') return <SkeletonRows />;
  if (status === 'error') {
    return (
      <ErrorPanel
        message={error?.message || 'unknown error'}
        index="`sellerUid` + `createdAt` desc"
      />
    );
  }
  if (orders.length === 0) {
    return (
      <EmptyPanel
        title="No orders yet"
        body="When a buyer places an order on one of your ads (mobile or web), it'll show up here in real time."
      />
    );
  }
  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <OrderRow key={o.id} order={o} />
      ))}
    </ul>
  );
}

function OrderRow({ order }) {
  const [busy, setBusy] = useState(null); // 'confirm' | 'ship' | 'cancel' | null

  async function run(action) {
    setBusy(action);
    try {
      if (action === 'cancel') {
        await sellerCancelOrder(order);
      } else {
        await sellerAdvanceOrder(order, action === 'confirm' ? 'confirm' : 'mark_shipped');
      }
    } catch (err) {
      alert(err?.message || 'Action failed.');
    } finally {
      setBusy(null);
    }
  }

  const tone = STATUS_TONE[order.status] || STATUS_TONE.Pending;

  return (
    <li className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
          {order.adThumbnailUrl ? (
            <img src={order.adThumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-slate-400 text-xs">
              No image
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono text-xs text-slate-500">
              {order.orderNumber}
            </span>
            <span
              className={
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ' +
                tone
              }
            >
              {order.status}
            </span>
          </div>
          <div className="mt-1 font-semibold text-slate-900 truncate">
            {order.adTitle || 'Untitled listing'}
          </div>
          <div className="mt-0.5 text-sm text-slate-500 truncate">
            {order.delivery?.fullName || 'Buyer'}
            {order.delivery?.city ? ` · ${order.delivery.city}` : ''}
            {' · '}
            {order.deliveryMethod === 'hand' ? 'Hand-to-hand' : 'Home delivery'}
            {' · '}
            {order.paymentMethod === 'online' ? 'Online' : 'Cash'}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {formatDateTime(order.createdAt)}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 sm:min-w-[180px]">
          <div className="text-lg font-bold text-brand-600">
            {formatPrice(order.totalCents, order.currency)}
          </div>
          <div className="flex flex-wrap gap-2">
            {order.status === 'Pending' && (
              <>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => run('confirm')}
                  className="rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-60"
                >
                  {busy === 'confirm' ? 'Working…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => run('cancel')}
                  className="rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 disabled:opacity-60"
                >
                  Cancel
                </button>
              </>
            )}
            {order.status === 'In Progress' && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run('mark_shipped')}
                className="rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-60"
              >
                {busy === 'mark_shipped' ? 'Working…' : 'Mark shipped'}
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function AdsSection({ status, error, ads }) {
  if (status === 'loading') return <SkeletonRows />;
  if (status === 'error') {
    return (
      <ErrorPanel
        message={error?.message || 'unknown error'}
        index="`ownerUid` + `createdAt` desc"
      />
    );
  }
  if (ads.length === 0) {
    return (
      <EmptyPanel
        title="You haven't posted any ads"
        body="List an item from the mobile app — it'll show up here instantly."
      />
    );
  }
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ads.map((ad) => (
        <li
          key={ad.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="relative aspect-[4/3] bg-slate-100">
            {ad.thumbnailUrl ? (
              <img src={ad.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                No image
              </div>
            )}
            <span
              className={
                'absolute top-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
                (ad.status === 'active'
                  ? 'bg-emerald-500/95 text-white'
                  : ad.status === 'sold'
                    ? 'bg-slate-700/95 text-white'
                    : 'bg-amber-500/95 text-white')
              }
            >
              {ad.status === 'active'
                ? 'Active'
                : ad.status === 'sold'
                  ? 'Sold'
                  : 'Hidden'}
            </span>
          </div>
          <div className="p-4 space-y-1">
            <div className="text-base font-bold text-brand-600">
              {formatPrice(ad.priceCents, ad.currency)}
            </div>
            <div className="font-medium text-slate-900 truncate" title={ad.title}>
              {ad.title || 'Untitled'}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 truncate">
                <Icon name="pin" className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{cityLabel(ad.city) || '—'}</span>
              </span>
              {ad.category && (
                <span className="inline-flex items-center gap-1 truncate">
                  · {categoryLabel(ad.category)}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SkeletonRows() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4"
        >
          <div className="w-20 h-20 rounded-xl bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyPanel({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{body}</p>
    </div>
  );
}

function ErrorPanel({ message, index }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Couldn’t load: {message}
      {index && (
        <div className="text-red-800/80 mt-1">
          Firestore needs a composite index on {index}. The browser console
          should show a one-click "Create index" link the first time.
        </div>
      )}
    </div>
  );
}
