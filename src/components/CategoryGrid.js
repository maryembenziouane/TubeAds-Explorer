/**
 * Category strip — pastel rounded-square tiles synced with Firestore filters
 * (same taxonomy as the React Native taxonomy in `categories.js`).
 *
 * Matches reference layout: All + Vehicles + … + Kids & Baby + More (overflow).
 */
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';

const PRIMARY = [
  { id: null, label: 'All', icon: 'grid', sq: 'bg-brand-500 text-white', activeRing: true, isAll: true },
  { id: 'vehicles', label: 'Vehicles', icon: 'car', sq: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100' },
  { id: 'real-estate', label: 'Real Estate', icon: 'home', sq: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' },
  { id: 'electronics', label: 'Electronics', icon: 'cpu', sq: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100' },
  { id: 'home', label: 'Home & Garden', icon: 'sofa', sq: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' },
  { id: 'fashion', label: 'Fashion', icon: 'tshirt', sq: 'bg-pink-50 text-pink-600 ring-1 ring-pink-100' },
  { id: 'kids-baby', label: 'Kids & Baby', icon: 'baby', sq: 'bg-sky-100 text-sky-700 ring-1 ring-sky-100' },
];

const MORE = [
  { id: 'services', label: 'Services', icon: 'wrench', sq: 'bg-teal-50 text-teal-600 ring-1 ring-teal-100' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase', sq: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100' },
  { id: 'rugs', label: 'Rugs', icon: 'rug', sq: 'bg-rose-50 text-rose-600 ring-1 ring-rose-100' },
  { id: 'other', label: 'Others', icon: 'grid', sq: 'bg-slate-100 text-slate-600 ring-1 ring-slate-100' },
];

export default function CategoryGrid({ selected, onSelect }) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[1.35rem]">
        Browse by category
      </h2>
      <div className="mt-6 grid grid-cols-4 gap-4 sm:grid-cols-4 md:flex md:flex-wrap md:justify-between md:gap-5">
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
          'flex h-[4.75rem] w-[4.75rem] shrink-0 items-center justify-center rounded-2xl transition md:h-[5.25rem] md:w-[5.25rem] ' +
          squareClass +
          (selected && isAll
            ? ' ring-2 ring-brand-500 ring-offset-2 ring-offset-white shadow-md '
            : selected && !isAll
              ? ' ring-2 ring-brand-500 ring-offset-2 ring-offset-white shadow-md '
              : ' hover:-translate-y-0.5 hover:shadow-md ')
        }
      >
        <Icon name={icon} className={`h-[1.7rem] w-[1.7rem] md:h-8 md:w-8 ${isAll && selected ? 'text-white' : ''}`} />
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
            'flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-2xl transition md:h-[5.25rem] md:w-[5.25rem] ' +
            (openFromSelection
              ? 'bg-brand-500 text-white ring-2 ring-brand-400 ring-offset-2 ring-offset-white shadow-md'
              : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:shadow-md')
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
          More
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
