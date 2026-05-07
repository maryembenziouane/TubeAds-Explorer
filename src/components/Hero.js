/**
 * Home hero — Avito-style: warm slab, product visual on the right, French copy +
 * search + stat pills. No floating review card on the artwork.
 */
import { useState } from 'react';
import { CATEGORIES } from '../services/categories';
import { Icon } from './Icons';

/** Warm interior / accent chair — used when `/hero.png` is missing in `public/` */
const HERO_CHAIR_IMG =
  'https://images.unsplash.com/photo-1567538096639-e9147b7e6a32?auto=format&fit=crop&w=960&q=85';

const CREAM = '#fdf6f0';

/** Display-only French labels; Firestore still stores English `CATEGORIES[].label`. */
const CATEGORY_FR = {
  vehicles: 'Véhicules',
  'real-estate': 'Immobilier',
  electronics: 'Électronique',
  fashion: 'Mode',
  home: 'Maison & jardin',
  'kids-baby': 'Bébé & enfants',
  jobs: 'Emploi',
  services: 'Services',
  rugs: 'Tapis',
  other: 'Autres',
};

const HERO_STATS = [
  { id: 'ads', label: '10K+ annonces', icon: 'grid', tone: 'bg-white text-brand-600 ring-1 ring-slate-200/90' },
  { id: 'users', label: '5K+ utilisateurs', icon: 'user', tone: 'bg-white text-sky-600 ring-1 ring-slate-200/90' },
  { id: 'cities', label: '20+ villes', icon: 'pin', tone: 'bg-white text-emerald-600 ring-1 ring-slate-200/90' },
  { id: 'safe', label: 'Annonces modérées', icon: 'shield', tone: 'bg-white text-violet-600 ring-1 ring-slate-200/90' },
];

export default function Hero({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSubmit,
}) {
  const [heroSrc, setHeroSrc] = useState(
    () => `${process.env.PUBLIC_URL || ''}/hero.png`,
  );

  return (
    <section
      className="relative w-full overflow-hidden rounded-b-[2rem] border-b border-slate-100/80"
      style={{ backgroundColor: CREAM }}
      aria-label="Recherche marketplace"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-stretch gap-8 px-4 pb-10 pt-6 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-8 lg:pb-14 lg:pt-10">
        <div className="flex min-w-0 flex-1 flex-col justify-center lg:max-w-[52%] lg:pr-6">
          <h1 className="text-balance text-[2rem] font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.15rem]">
            Achetez et vendez <span className="text-brand-500">tout</span>, simplement
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Des bonnes affaires près de chez vous, avec des annonces vidéo comme sur mobile.
          </p>

          <form
            className="mt-7 max-w-xl"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit?.();
            }}
          >
            <div className="flex min-h-[52px] flex-wrap items-stretch gap-1 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-lg shadow-slate-900/[0.06] focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-200 sm:flex-nowrap sm:rounded-full">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:min-w-[140px]">
                <Icon name="search" className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Rechercher une annonce…"
                  aria-label="Recherche"
                  className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>

              <div className="hidden h-8 w-px self-center bg-slate-200 sm:block" />

              <div className="relative min-w-[130px] shrink-0 px-1 sm:max-w-[175px]">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => onCategoryChange(e.target.value || null)}
                  aria-label="Filtrer par catégorie"
                  className="h-full w-full cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pr-8 pl-2 text-sm font-medium text-slate-700 outline-none sm:rounded-none sm:border-0"
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
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="shrink-0 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 sm:rounded-full sm:px-7"
              >
                Rechercher
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
            {HERO_STATS.map((s) => (
              <div
                key={s.id}
                className={
                  'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold shadow-sm sm:text-[13px] ' +
                  s.tone
                }
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50/90 text-slate-700">
                  <Icon name={s.icon} className="h-3.5 w-3.5" />
                </span>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-1 justify-center lg:max-w-[48%] lg:justify-end">
          <div className="relative w-full max-w-[min(100%,420px)] lg:max-w-[460px]">
            <img
              src={heroSrc}
              alt=""
              className="h-auto w-full max-h-[min(42vh,360px)] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(15,23,42,0.12)] lg:max-h-[min(52vh,440px)]"
              onError={() =>
                setHeroSrc((prev) => (prev === HERO_CHAIR_IMG ? prev : HERO_CHAIR_IMG))
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
