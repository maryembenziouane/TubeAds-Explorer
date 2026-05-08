/**
 * Marketplace header — reference layout: brand, centered search, Catégories / Messages + utilities.
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useIsAdmin from '../hooks/useIsAdmin';
import { APP_NAME } from '../constants/branding';
import { SITE_GUTTER_CLASS, SITE_MAX_WIDTH_CLASS } from '../constants/layout';
import { Icon } from './Icons';

const MOBILE_NAV = [
  { id: 'home', label: 'Accueil' },
  { id: 'categories', label: 'Catégories' },
  { id: 'listings', label: 'Annonces' },
  { id: 'messages', label: 'Messages' },
];

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

const LOCALE_STORAGE = 'marketplace-locale';

function accountLabel(user) {
  if (!user) return '';
  const d = user.displayName?.trim();
  if (d) return d.split(/\s+/)[0];
  const email = user.email?.trim();
  if (email) return email.split('@')[0];
  return 'Compte';
}

export default function Header({
  activeNavId = 'home',
  onNavigate,
  onOpenMessages,
  onLogin,
  onAdminDashboard,
  transparent = false,
  locale,
  onLocaleChange,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
}) {
  const { user, signOut } = useAuth();
  const { isAdmin, ready } = useIsAdmin();
  const [accountOpen, setAccountOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langWrapRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (langWrapRef.current && !langWrapRef.current.contains(e.target)) {
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
    (typeof window !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE) || 'fr' : 'fr');

  function pickLang(code) {
    onLocaleChange?.(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE, code);
      document.documentElement.lang = code === 'ar' ? 'ar' : code === 'en' ? 'en' : 'fr';
      document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    }
    setLangOpen(false);
  }

  useEffect(() => {
    const code =
      locale ||
      (typeof window !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE) : null) ||
      'fr';
    document.documentElement.lang = code === 'ar' ? 'ar' : code === 'en' ? 'en' : 'fr';
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const langLabel = LANGS.find((l) => l.code === resolvedLocale)?.label ?? 'FR';

  const headerClass = transparent
    ? 'sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.05)]'
    : 'sticky top-0 z-50 border-b border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]';

  return (
    <header className={headerClass}>
      <div className={`mx-auto ${SITE_MAX_WIDTH_CLASS} ${SITE_GUTTER_CLASS}`}>
        <div className="flex flex-col gap-3 py-3 sm:py-0 sm:pb-0">
          <div className="flex h-[60px] items-center gap-3 sm:h-[72px] sm:gap-4">
            <a
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              aria-label={`${APP_NAME} · Accueil`}
              onClick={(e) => {
                e.preventDefault();
                handleNav('home');
              }}
            >
              <img
                src={`${process.env.PUBLIC_URL || ''}/logosite.png`}
                alt=""
                className="h-10 w-auto shrink-0 object-contain"
                draggable="false"
              />
              <span className="hidden text-lg font-extrabold tracking-tight text-slate-900 min-[400px]:inline sm:text-xl">
                {APP_NAME}
              </span>
            </a>

            <form
              role="search"
              className="hidden min-w-0 flex-1 md:block"
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit?.();
              }}
            >
              <label className="mx-auto flex h-11 w-full max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-white px-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)] lg:mx-0 lg:max-w-none">
                <Icon name="search" className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Rechercher une voiture, un téléphone…"
                  aria-label="Recherche"
                  className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </label>
            </form>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
              {ready && isAdmin && (
                <button
                  type="button"
                  onClick={() => onAdminDashboard?.()}
                  className="mr-1 hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 lg:inline-flex"
                >
                  Admin
                </button>
              )}

              <button
                type="button"
                onClick={() => handleNav('categories')}
                className={
                  'hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition sm:inline-flex ' +
                  (activeNavId === 'categories'
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-700 hover:bg-slate-50')
                }
              >
                <Icon name="grid" className="h-4 w-4" />
                <span className="hidden lg:inline">Catégories</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('messages')}
                className={
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ' +
                  (activeNavId === 'messages'
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-700 hover:bg-slate-50')
                }
              >
                <Icon name="message" className="h-4 w-4" />
                <span className="hidden lg:inline">Messages</span>
              </button>

              <button
                type="button"
                className="relative grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-slate-50"
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
                  className="inline-flex h-11 items-center gap-1 rounded-full px-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-3"
                >
                  <Icon name="globe" className="h-5 w-5 shrink-0" />
                  <span className="min-w-[28px] text-left">{langLabel}</span>
                  <Icon name="chevronDown" className="h-3.5 w-3.5 shrink-0 text-slate-500" />
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
                            (resolvedLocale === l.code ? 'font-semibold text-brand-600' : '')
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
                    className="flex max-w-[140px] items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-50"
                    aria-label="Compte"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 ring-2 ring-white">
                      {(user.email || user.displayName || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hidden truncate text-sm font-semibold text-slate-800 min-[900px]:inline">
                      {accountLabel(user)}
                    </span>
                    <Icon name="chevronDown" className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  </button>
                  {accountOpen && (
                    <div
                      role="menu"
                      onMouseLeave={() => setAccountOpen(false)}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl"
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
                        Mes commandes
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
                        className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setAccountOpen(false);
                          signOut();
                        }}
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onLogin?.()}
                  className="grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-slate-50"
                  aria-label="Connexion"
                >
                  <Icon name="user" className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <form
            role="search"
            className="pb-2 md:hidden"
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit?.();
            }}
          >
            <label className="flex h-11 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <Icon name="search" className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Rechercher une voiture, un téléphone…"
                aria-label="Recherche"
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </label>
          </form>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto pb-3 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Navigation mobile"
        >
          {MOBILE_NAV.map((item) => {
            const active = activeNavId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ' +
                  (active ? 'bg-brand-50 text-brand-600' : 'bg-white text-slate-700 ring-1 ring-slate-200/80')
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
