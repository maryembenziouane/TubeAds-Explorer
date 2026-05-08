import { APP_NAME } from '../constants/branding';
import { SITE_GUTTER_CLASS, SITE_MAX_WIDTH_CLASS } from '../constants/layout';
import TrustStrip from './TrustStrip';

const ABOUT = [
  { label: 'Qui sommes-nous' },
  { label: 'Carrières' },
  { label: 'Presse' },
];

const HELP = [
  { label: "Centre d'aide" },
  { label: "Conditions d'utilisation" },
  { label: 'Politique de confidentialité' },
];

const SERVICES = [{ label: 'Livraison' }, { label: 'Paiement sécurisé' }, { label: 'Protection acheteur' }];

/**
 * Marketplace footer — 4 colonnes + ligne « Suivez-nous » / badges appli, comme la maquette.
 */
export default function Footer({ onHome }) {
  return (
    <>
      <TrustStrip />
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className={`mx-auto ${SITE_MAX_WIDTH_CLASS} py-12 ${SITE_GUTTER_CLASS}`}>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-12">
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="button"
                onClick={() => onHome?.()}
                className="flex items-center gap-2.5 font-semibold text-slate-900 transition hover:text-brand-600"
              >
                <img
                  src={`${process.env.PUBLIC_URL || ''}/logosite.png`}
                  alt=""
                  className="h-8 w-auto shrink-0 object-contain"
                  draggable="false"
                />
                <span className="text-lg tracking-tight">{APP_NAME}</span>
              </button>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
                La façon la plus simple d&apos;acheter et de vendre en toute confiance, partout au Maroc.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-sm font-semibold text-slate-900">À propos</h4>
              <ul className="mt-4 space-y-2.5">
                {ABOUT.map(({ label }) => (
                  <li key={label}>
                    <span className="cursor-default text-sm text-slate-600 transition hover:text-brand-600">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-sm font-semibold text-slate-900">Aide &amp; Support</h4>
              <ul className="mt-4 space-y-2.5">
                {HELP.map(({ label }) => (
                  <li key={label}>
                    <span className="cursor-default text-sm text-slate-600 transition hover:text-brand-600">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-sm font-semibold text-slate-900">Nos services</h4>
              <ul className="mt-4 space-y-2.5">
                {SERVICES.map(({ label }) => (
                  <li key={label}>
                    <span className="cursor-default text-sm text-slate-600 transition hover:text-brand-600">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-8 border-t border-slate-200 pt-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Suivez-nous</h4>
              <div className="mt-4 flex flex-wrap gap-2">
                <SocialIcon label="Facebook" className="bg-slate-900 text-white">
                  <FacebookGlyph />
                </SocialIcon>
                <SocialIcon
                  label="Instagram"
                  className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-white"
                >
                  <InstagramGlyph />
                </SocialIcon>
                <SocialIcon label="TikTok" className="bg-slate-900 text-white">
                  <TikTokGlyph />
                </SocialIcon>
                <SocialIcon label="YouTube" className="bg-red-600 text-white">
                  <YouTubeGlyph />
                </SocialIcon>
              </div>
            </div>
            <div className="sm:text-right">
              <h4 className="text-sm font-semibold text-slate-900">Téléchargez notre application</h4>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <StoreBadge kind="google" />
                <StoreBadge kind="apple" />
              </div>
            </div>
          </div>

          <p className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
            © 2026 {APP_NAME}. Tous droits réservés.
          </p>
        </div>
      </footer>
    </>
  );
}

function SocialIcon({ label, children, className }) {
  return (
    <span
      title={label}
      className={
        'grid h-10 w-10 cursor-default place-items-center rounded-full shadow-sm transition hover:opacity-90 ' +
        (className || '')
      }
      aria-label={label}
    >
      {children}
    </span>
  );
}

function StoreBadge({ kind }) {
  if (kind === 'google') {
    return (
      <span className="inline-flex h-11 min-w-[148px] items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-md">
        <PlayTriangle className="h-5 w-5 shrink-0 text-sky-400" />
        <span className="text-left leading-tight">
          <span className="block text-[9px] font-normal uppercase tracking-wide text-slate-300">
            DISPONIBLE SUR
          </span>
          <span className="text-[13px] font-bold leading-tight">Google Play</span>
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-11 min-w-[148px] items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-md">
      <AppleGlyph className="h-5 w-5 text-white" />
      <span className="text-left leading-tight">
        <span className="block text-[9px] font-normal text-slate-300">Télécharger sur</span>
        <span className="font-bold">App Store</span>
      </span>
    </span>
  );
}

function FacebookGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" {...props}>
      <path d="M13.5 22v-9h3l.5-4h-3V7c0-1 .6-1.3 1.4-1.3H17V2c-.3 0-1.8-.1-3.4-.1-3.3 0-5.6 2-5.6 5.7V9H5v4h3v9h5.5z" />
    </svg>
  );
}

function InstagramGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function TikTokGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" {...props}>
      <path d="M14.5 4.5c.9 1.5 2.4 2.5 4.2 2.6V10a7.4 7.4 0 0 1-4.2-1.3v7.5a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3a2.5 2.5 0 1 0 2.4 2.5V4.5h1.2z" />
    </svg>
  );
}

function YouTubeGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" {...props}>
      <path d="M21.8 8.2s-.2-1.7-1-2.4c-.9-1-2-1-2.4-1C16 4.5 12 4.5 12v.3-3s4-.1 6.4.3c.4.1 1.5.1 2.4 1 .8.7 1 2.4 1 2.4s.3 2 .3 3.9v1.8c0 1.9-.3 3.9-.3 3.9s-.2 1.7-1 2.4c-.9 1-2.1 1-2.5 1.1-1.8.2-6.1.2-6.1.2s-4.5 0-6.4-.3c-.4-.1-1.5-.1-2.4-1-.8-.7-1-2.4-1-2.4S2 15.9 2 14v-1.8c0-1.9.3-3.9.3-3.9zm-8.7 5 5-2.5-5-2.5v5z" />
    </svg>
  );
}

function PlayTriangle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  );
}

function AppleGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.4 2c-.4 2.6 2.3 4 2.4 4-1.1.8-1.9 2.2-1.9 3.6 0 2.3 1.8 3.6 2 3.7-.1.2-.4 2.6-1.6 5.1-1 2-2 4-3.4 4-.6 0-1-.2-2-.2-1.2 0-1.5.2-2.4.2-1.4 0-2.4-1.4-3.4-3.5C6 16.8 4.5 13.5 4.5 10.6c0-4 2.6-6.1 5.1-6.1.9 0 1.8.3 2.6.9.5.3.9.7 1.3 1 .2-.5.5-1.4 1.3-2.2 1.2-1.3 2.6-1.5 3.6-1.6Z" />
    </svg>
  );
}
