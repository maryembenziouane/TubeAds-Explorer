import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from './Icons';

export default function LoginModal({ open, onClose }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] grid place-items-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {mode === 'signin'
                ? 'Sign in with the same account as the mobile app. This site is browse-only — listing happens in the app.'
                : 'Use one account on web and mobile — favorites and messages stay in sync.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 -m-2 text-slate-500 hover:text-slate-800"
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[15px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </span>
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[15px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              placeholder="At least 6 characters"
            />
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 text-sm disabled:opacity-60 transition"
          >
            {busy
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          {mode === 'signin' ? (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
