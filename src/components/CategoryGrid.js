/**
 * Category strip — pastel rounded-square tiles synced with Firestore filters
 * (same taxonomy as the React Native taxonomy in `categories.js`).
 *
 * Matches reference layout: All + Vehicles + … + Kids & Baby + More (overflow).
 */
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';

const PRIMARY = [
  {
    id: null,
    label: 'Tout',
    icon: 'grid',
    sq: 'bg-brand-500 text-white shadow-md shadow-brand-500/20 ring-0',
    activeRing: true,
    isAll: true,
  },
  { id: 'vehicles', label: 'Véhicules', icon: 'car', sq: 'bg-white text-sky-600 shadow-sm ring-1 ring-slate-100' },
  { id: 'real-estate', label: 'Immobilier', icon: 'home', sq: 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100' },
  { id: 'electronics', label: 'Électronique', icon: 'cpu', sq: 'bg-white text-violet-600 shadow-sm ring-1 ring-slate-100' },
  { id: 'home', label: 'Maison & jardin', icon: 'sofa', sq: 'bg-white text-amber-600 shadow-sm ring-1 ring-slate-100' },
  { id: 'fashion', label: 'Mode', icon: 'tshirt', sq: 'bg-white text-pink-600 shadow-sm ring-1 ring-slate-100' },
  { id: 'kids-baby', label: 'Bébé & enfants', icon: 'baby', sq: 'bg-white text-sky-700 shadow-sm ring-1 ring-slate-100' },
];

const MORE = [
  { id: 'services', label: 'Services', icon: 'wrench', sq: 'bg-white text-teal-600 shadow-sm ring-1 ring-slate-100' },
  { id: 'jobs', label: 'Emploi', icon: 'briefcase', sq: 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100' },
  { id: 'rugs', label: 'Tapis', icon: 'rug', sq: 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-100' },
  { id: 'other', label: 'Autres', icon: 'grid', sq: 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-100' },
];

export default function CategoryGrid({ selected, onSelect }) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        Parcourir par catégorie
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
        Touchez une catégorie pour filtrer les annonces sur la page.
      </p>
      <div className="mt-8 grid grid-cols-4 gap-3 sm:gap-4 md:flex md:flex-wrap md:justify-between md:gap-5">
        {PRIMARY.map((t) => {
          const selectedHere = t.isAll ? !selected : selected === t.id;
          return (
            <CatTile
              key={String(t.id ?? 'all')}
              label={t.label}
              icon={t.icon}
              squareClass={t.sq}
              selected={selectedHere}
              isAll={t.isAll}
              onClick={() => onSelect?.(t.id)}
            />
          );
        })}
        <MorePopover selected={selected} onSelect={onSelect} extras={MORE} />
      </div>
    </section>
  );
}

function CatTile({ label, icon, squareClass, selected, isAll, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <span
        className={
          'flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl transition md:h-[5rem] md:w-[5rem] ' +
          squareClass +
          (selected && isAll
            ? ' ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50 shadow-md '
            : selected && !isAll
              ? ' ring-2 ring-brand-500 ring-offset-2 ring-offset-white shadow-md '
              : ' hover:-translate-y-0.5 hover:shadow-md ')
        }
      >
        <Icon
          name={icon}
          className={`h-[1.65rem] w-[1.65rem] md:h-7 md:w-7 ${isAll && selected ? 'text-white' : ''}`}
        />
      </span>
      <span
        className={
          'text-center text-xs font-semibold md:text-[13px] ' +
          (selected ? 'text-brand-600' : 'font-medium text-slate-700')
        }
      >
        {label}
      </span>
    </button>
  );
}

function MorePopover({ selected, onSelect, extras }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const openFromSelection = extras.some((e) => e.id === selected);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-md"
      >
        <span
          className={
            'flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl transition md:h-[5rem] md:w-[5rem] ' +
            (openFromSelection
              ? 'bg-brand-500 text-white ring-2 ring-brand-400 ring-offset-2 ring-offset-white shadow-md'
              : 'bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 hover:-translate-y-0.5 hover:shadow-md')
          }
        >
          <span className="flex items-end gap-[3px]" aria-hidden>
            {[0, 1, 2].map((k) => (
              <span key={k} className="block h-[5px] w-[5px] rounded-full bg-current" />
            ))}
          </span>
        </span>
        <span
          className={
            'text-center text-xs font-semibold md:text-[13px] ' +
            (openFromSelection ? 'text-brand-600' : 'font-medium text-slate-700')
          }
        >
          Plus
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-max min-w-[12rem] max-w-[16rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {extras.map((t) => {
            const on = selected === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-slate-50 ' +
                  (on ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-700')
                }
                onClick={() => {
                  onSelect?.(t.id);
                  setOpen(false);
                }}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${t.sq}`}>
                  <Icon name={t.icon} className="h-[18px] w-[18px]" />
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
