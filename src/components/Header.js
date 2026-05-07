/**
 * Site header — Avito-style chrome: transparent over the hero on the home
 * page, brand + centered primary nav, utility cluster (notifications ·
 * language · account). Read-only marketplace: no posting or upload entry
 * points anywhere in this bar.
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useIsAdmin from '../hooks/useIsAdmin';
import { Icon } from './Icons';
import logoUrl from '../logo.png';

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'categories', label: 'Categories' },
  { id: 'listings', label: 'Listings' },
  { id: 'messages', label: 'Messages' },
];

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

const LOCALE_STORAGE = 'marketplace-locale';

export default function Header({
  activeNavId = 'home',
  onNavigate,
  onOpenMessages,
  onLogin,
  onAdminDashboard,
  transparent = false,
  locale,
  onLocaleChange,
}) {
  const { user, signOut } = useAuth();
  const { isAdmin, ready } = useIsAdmin();
  const [accountOpen, setAccountOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langWrapRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (
        langWrapRef.current &&
        !langWrapRef.current.contains(e.target)
      ) {
        setLangOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function handleNav(id) {
    if (id === 'messages') {
      onOpenMessages?.();
      return;
    }
    onNavigate?.(id);
  }

  const resolvedLocale =
    locale ||
    (typeof window !== 'undefined'
      ? localStorage.getItem(LOCALE_STORAGE) || 'fr'
      : 'fr');

  function pickLang(code) {
    onLocaleChange?.(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE, code);
      document.documentElement.lang =
        code === 'ar' ? 'ar' : code === 'en' ? 'en' : 'fr';
      document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    }
    setLangOpen(false);
  }

  useEffect(() => {
    const code =
      locale ||
      (typeof window !== 'undefined'
        ? localStorage.getItem(LOCALE_STORAGE)
        : null) ||
      'fr';
    document.documentElement.lang =
      code === 'ar' ? 'ar' : code === 'en' ? 'en' : 'fr';
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const langLabel =
    LANGS.find((l) => l.code === resolvedLocale)?.label ?? 'FR';

  const headerClass =
    'sticky top-0 z-50 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)]';

  return (
    <header className={headerClass}>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center gap-4">
          {/* Brand */}
          <a
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label="Marketplace · Home"
            onClick={(e) => {
              e.preventDefault();
              handleNav('home');
            }}
          >
            <img src={logoUrl} alt="" className="h-10 w-auto object-contain sm:h-11" />
            <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Marketplace
            </span>
          </a>

          {/* Main nav */}
          <nav
            aria-label="Main"
            className="hidden md:flex flex-1 items-center justify-center gap-0.5 lg:gap-1"
          >
            {NAV.map((item) => {
              const active = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={
                    'relative px-3 py-2 text-sm font-semibold transition-colors lg:px-3.5 ' +
                    (active ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900')
                  }
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute bottom-1 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full bg-brand-500 md:bottom-0.5"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Utilities */}
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            {ready && isAdmin && (
              <button
                type="button"
                onClick={() => onAdminDashboard?.()}
                className="mr-1 hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 sm:inline-flex"
              >
                Admin Dashboard
              </button>
            )}
            <button
              type="button"
              className="relative grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-black/[0.04]"
              aria-label="Notifications"
            >
              <Icon name="bell" className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500 shadow-sm" />
            </button>

            <div className="relative" ref={langWrapRef}>
              <button
                type="button"
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                onClick={() => setLangOpen((v) => !v)}
                className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-slate-700 transition hover:bg-black/[0.04] sm:px-3"
              >
                <Icon name="globe" className="h-5 w-5 shrink-0" />
                <span className="min-w-[28px] text-left">{langLabel}</span>
                <Icon name="chevronDown" className="h-3.5 w-3.5 opacity-70" />
              </button>
              {langOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 z-[60] mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg"
                >
                  {LANGS.map((l) => (
                    <li key={l.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={resolvedLocale === l.code}
                        onClick={() => pickLang(l.code)}
                        className={
                          'flex w-full items-center px-3 py-2 text-left hover:bg-slate-50 ' +
                          (resolvedLocale === l.code
                            ? 'font-semibold text-brand-600'
                            : '')
                        }
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-black/[0.04]"
                  aria-label="Account"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 ring-2 ring-white">
                    {(user.email || '?').slice(0, 1).toUpperCase()}
                  </span>
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    onMouseLeave={() => setAccountOpen(false)}
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl"
                  >
                    <div className="truncate px-3 py-2 text-xs text-slate-500">
                      {user.email}
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-3 py-2 text-left hover:bg-slate-50"
                      onClick={() => {
                        setAccountOpen(false);
                        onNavigate?.('orders');
                      }}
                    >
                      My orders
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-3 py-2 text-left hover:bg-slate-50"
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenMessages?.();
                      }}
                    >
                      Messages
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                      onClick={() => {
                        setAccountOpen(false);
                        signOut();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onLogin?.()}
                className="grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-black/[0.04]"
                aria-label="Sign in"
              >
                <Icon name="user" className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile scroll nav */}
        <nav
          className="flex gap-1 overflow-x-auto pb-3 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Mobile"
        >
          {NAV.map((item) => {
            const active = activeNavId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ' +
                  (active ? 'bg-brand-50 text-brand-600' : 'text-slate-700 bg-white')
                }
              >
                {item.label}
              </button>
            );
          })}
          {ready && isAdmin && (
            <button
              type="button"
              onClick={() => onAdminDashboard?.()}
              className="whitespace-nowrap rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700"
            >
              Admin
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
