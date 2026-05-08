/**
 * Hero — fond `/hero.png`, cover + center right, sans flou ni calque assombri.
 * Contenu limité à 50 % du conteneur site pour ne pas recouvrir le décor à droite.
 */
import { SITE_GUTTER_CLASS, SITE_MAX_WIDTH_CLASS } from '../constants/layout';
import { CATEGORIES, CITIES } from '../services/categories';
import { Icon } from './Icons';

// CRITICAL: background must remain sharp (no blur/backdrop/opacity overlays).
const HERO_BG = `${process.env.PUBLIC_URL || ''}/logo.png`;

const CATEGORY_FR = {
  vehicles: 'Véhicules',
  'real-estate': 'Immobilier',
  electronics: 'Électronique',
  fashion: 'Mode',
  home: 'Maison & jardin',
  'kids-baby': 'Enfants',
  jobs: 'Emploi',
  services: 'Services',
  rugs: 'Tapis',
  other: 'Autres',
};

const HERO_STATS = [
  {
    id: 'ads',
    label: '10K+ Annonces',
    icon: 'fileText',
    iconWrap: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'users',
    label: '5K+ Utilisateurs',
    icon: 'user',
    iconWrap: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'cat',
    label: '20+ Catégories',
    icon: 'grid',
    iconWrap: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'safe',
    label: '100% Sécurisé',
    icon: 'shield',
    iconWrap: 'bg-sky-50 text-sky-600',
  },
];

const heroBgStyle = {
  backgroundImage: `url(${HERO_BG})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center right',
  backgroundRepeat: 'no-repeat',
  filter: 'none',
  backdropFilter: 'none',
};

export default function Hero({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCity,
  onCityChange,
  onSubmit,
}) {
  return (
    <section
      className="relative w-full overflow-hidden rounded-b-3xl bg-no-repeat"
      style={heroBgStyle}
      aria-label="Recherche marketplace"
    >
      <div className={`relative mx-auto ${SITE_MAX_WIDTH_CLASS} lg:min-h-[min(86vw,520px)]`}>
        <div className={`flex justify-start ${SITE_GUTTER_CLASS}`}>
          <div className="w-full min-w-0 max-w-full pt-14 pb-10 sm:pt-16 sm:pb-12 lg:max-w-[50%] lg:pt-20 lg:pb-14 lg:pr-8 xl:pr-12">
            <h1 className="text-balance text-4xl font-extrabold leading-[1.03] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Achetez et vendez tout, <span className="text-brand-500">simplement</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-[15px]">
              Des bonnes affaires près de chez vous, avec des annonces vidéo comme sur mobile.
            </p>

            <form
              className="mt-6 sm:mt-7"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.();
              }}
            >
              <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_6px_26px_rgba(15,23,42,0.08)] sm:rounded-full">
                <div className="flex min-h-[38px] w-full flex-col divide-y divide-slate-100 sm:flex-row sm:items-stretch sm:divide-x sm:divide-y-0">
                  <label className="flex min-h-[38px] min-w-0 flex-1 shrink items-center gap-2 bg-white px-3 py-1.5 sm:min-w-[6.5rem]">
                    <Icon name="search" className="h-3.5 w-3.5 shrink-0 text-slate-400 sm:h-4 sm:w-4" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Que recherchez-vous ?"
                      aria-label="Recherche"
                      className="min-h-0 min-w-0 flex-1 bg-transparent py-0.5 text-[13px] text-slate-900 placeholder:text-slate-400 outline-none sm:text-sm"
                    />
                  </label>

                  <div className="relative min-h-[38px] min-w-0 flex-1 sm:max-w-[9.5rem] sm:shrink-0">
                    <select
                      value={selectedCategory || ''}
                      onChange={(e) => onCategoryChange(e.target.value || null)}
                      aria-label="Catégorie"
                      className="h-full min-h-[38px] w-full cursor-pointer appearance-none bg-white py-1.5 pr-8 pl-2.5 text-[13px] font-medium text-slate-800 outline-none sm:text-sm"
                    >
                      <option value="">Toutes les catégories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {CATEGORY_FR[c.id] || c.label}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="chevronDown"
                      className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500"
                    />
                  </div>

                  <div className="relative min-h-[38px] min-w-0 flex-1 sm:max-w-[7.5rem] sm:shrink-0">
                    <select
                      value={selectedCity || ''}
                      onChange={(e) => onCityChange?.(e.target.value || null)}
                      aria-label="Ville"
                      className="h-full min-h-[38px] w-full cursor-pointer appearance-none bg-white py-1.5 pr-8 pl-2.5 text-[13px] font-medium text-slate-800 outline-none sm:text-sm"
                    >
                      <option value="">Toute la ville</option>
                      {CITIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="chevronDown"
                      className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[38px] shrink-0 bg-brand-500 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-brand-600 sm:rounded-r-full sm:px-7 sm:text-sm"
                  >
                    Rechercher
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-4 max-w-xl">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2">
              {HERO_STATS.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-white px-2 py-1.5 shadow-[0_1px_8px_rgba(15,23,42,0.05)]"
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md sm:h-7 sm:w-7 ${s.iconWrap}`}
                  >
                    <Icon name={s.icon} className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                  <span className="text-[9px] font-semibold leading-tight text-slate-800 sm:text-[10px]">
                    {s.label}
                  </span>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
