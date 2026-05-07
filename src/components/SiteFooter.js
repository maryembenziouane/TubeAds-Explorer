/**
 * Marketing footer — Avito-style columns + trust line.
 */
import useIsAdmin from '../hooks/useIsAdmin';
import { Icon } from './Icons';
import logoUrl from '../logo.png';

const COLS = [
  {
    title: 'À propos',
    links: [
      { label: 'Notre mission', href: '#' },
      { label: 'Comment ça marche', href: '#listings' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Catégories',
    links: [
      { label: 'Véhicules', href: '#categories' },
      { label: 'Immobilier', href: '#categories' },
      { label: 'Électronique', href: '#categories' },
      { label: 'Maison & mode', href: '#categories' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { label: 'Centre d’aide', href: '#' },
      { label: 'Sécurité', href: '#' },
      { label: 'Nous contacter', href: '#' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Conditions d’utilisation', href: '#' },
      { label: 'Confidentialité', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
];

export default function SiteFooter({ onHome, onAdminDashboard }) {
  const { isAdmin, ready } = useIsAdmin();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-12">
          <div className="max-w-sm">
            <a
              href="/"
              className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              onClick={(e) => {
                e.preventDefault();
                onHome?.();
              }}
            >
              <img src={logoUrl} alt="" className="h-9 w-auto object-contain" />
              <span className="text-lg font-extrabold tracking-tight text-slate-900">Marketplace</span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              La marketplace vidéo pour acheter et vendre au Maroc. Annonces vérifiées, boutiques
              pro et expérience simple sur tous vos écrans.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { id: 'facebook', label: 'Facebook' },
                { id: 'twitter', label: 'X (Twitter)' },
                { id: 'instagram', label: 'Instagram' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-brand-600"
                  aria-label={label}
                >
                  <SocialIcon id={id} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-slate-700 transition hover:text-brand-600"
                        onClick={(e) => {
                          if (l.href === '#listings' || l.href === '#categories') {
                            e.preventDefault();
                            document.getElementById(l.href.slice(1))?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            });
                          }
                        }}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Marketplace · Expérience web lecture seule · même projet
            Firebase que l’app mobile.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {ready && isAdmin && (
              <button
                type="button"
                onClick={() => onAdminDashboard?.()}
                className="text-xs font-semibold text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline"
              >
                Admin Dashboard
              </button>
            )}
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Icon name="globe" className="h-3.5 w-3.5" />
              Maroc · FR
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ id }) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  if (id === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  if (id === 'twitter') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
