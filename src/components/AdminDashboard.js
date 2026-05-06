import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useIsAdmin from '../hooks/useIsAdmin';
import { approveListing, listenPendingAds } from '../services/listings';
import { pushPath } from '../utils/routing';

function badge(text, tone) {
  const cls =
    tone === 'orange'
      ? 'bg-orange-50 text-orange-900 ring-orange-100'
      : 'bg-slate-50 text-slate-700 ring-slate-200';
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${cls}`}>{text}</span>;
}

export default function AdminDashboard({ onRequireLogin, onNavigateHome }) {
  const { user } = useAuth();
  const { isAdmin, ready } = useIsAdmin();
  const [items, setItems] = useState([]);
  const [approveBusy, setApproveBusy] = useState(() => new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = listenPendingAds(
      (pending) => {
        setItems(pending);
        setError(null);
      },
      setError,
    );
    return unsub;
  }, []);

  async function approve(adId) {
    setApproveBusy((prev) => new Set(prev).add(adId));
    setError(null);
    try {
      await approveListing(adId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setApproveBusy((prev) => {
        const n = new Set(prev);
        n.delete(adId);
        return n;
      });
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-10">
        <div className="text-sm font-semibold text-slate-700">Checking access…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-10 space-y-4">
        <h1 className="text-xl font-extrabold text-slate-900">Admin</h1>
        <p className="text-sm text-slate-600">Sign in to access the moderation dashboard.</p>
        <button
          type="button"
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-brand-600"
          onClick={onRequireLogin}
        >
          Sign in
        </button>
        <HomeLink onNavigateHome={onNavigateHome} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-10 space-y-4">
        <h1 className="text-xl font-extrabold text-slate-900">Forbidden</h1>
        <p className="text-sm text-slate-600">
          This dashboard is restricted. Use a Firebase Auth UID allowlist (<code className="font-mono text-xs">REACT_APP_ADMIN_UIDS</code>) during development or set{' '}
          <code className="font-mono text-xs">{`customClaims: { admin: true }`}</code>{' '}on your account.
        </p>
        <HomeLink onNavigateHome={onNavigateHome} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Admin dashboard</h1>
            {badge('Hidden route', 'orange')}
          </div>
          <p className="text-sm text-slate-600">Pending listings · approve to publish publicly.</p>
        </div>
        <HomeLink onNavigateHome={onNavigateHome} />
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
          Pending · {items.length}
        </div>
        <div className="divide-y divide-slate-200">
          {items.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-600">
              No ads with <code className="font-mono text-xs">status: &quot;pending&quot;</code> in Firestore.
              <div className="mt-2 text-xs text-slate-500">
                The home feed only keeps the newest listings client-side; this list uses a dedicated query so
                nothing is missed. Confirm edits set{' '}
                <code className="font-mono text-[11px]">status: &quot;pending&quot;</code> and that rules allow
                admins to read that query.
              </div>
            </div>
          ) : (
            items.map((ad) => {
              const busy = approveBusy.has(ad.id);
              return (
                <div key={ad.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="text-sm font-extrabold text-slate-900">{ad.title || 'Untitled'}</div>
                    <div className="text-xs text-slate-500">
                      <span className="font-mono text-[11px] text-slate-700">{ad.id}</span>
                      {' · '}
                      <span className="font-mono text-[11px]">owner {ad.ownerUid || '—'}</span>
                    </div>
                    <div className="break-all text-[11px] text-slate-500">{ad.videoUrl || '—'}</div>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-60"
                    onClick={() => approve(ad.id)}
                  >
                    {busy ? 'Approving…' : 'Approve'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function HomeLink({ onNavigateHome }) {
  return (
    <button
      type="button"
      className="text-sm font-bold text-brand-600 hover:underline"
      onClick={() => {
        pushPath('/');
        onNavigateHome?.();
      }}
    >
      ← Back to marketplace
    </button>
  );
}
