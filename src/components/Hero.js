/**
 * Home hero — Avito-style: full-width cream slab, lifestyle artwork locked to
 * the right (fully visible), headline + search occupying the left ~50%.
 */
import { CATEGORIES } from '../services/categories';
import { Icon } from './Icons';

const HERO_ART = `${process.env.PUBLIC_URL}/hero.png`;

const CREAM = '#fdf6f0';

export default function Hero({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSubmit,
}) {
  return (
    <section
      className="relative w-full min-h-[460px] overflow-hidden rounded-b-3xl md:min-h-[500px]"
      style={{
        backgroundColor: CREAM,
        backgroundImage: `url(${HERO_ART})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'contain',
      }}
      aria-label="Search marketplace"
    >
      <div className="mx-auto flex min-h-[460px] max-w-[1280px] items-center px-4 py-10 sm:min-h-[500px] sm:px-6 lg:px-8">
        <div className="w-full md:w-1/2 md:max-w-[50%] lg:pr-8">
          <h1 className="text-balance text-[2.15rem] font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
            Buy and sell <span className="text-brand-500">anything</span>, easily
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Find great deals near you.
          </p>

          <form
            className="mt-7 max-w-full"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit?.();
            }}
          >
            <div className="flex min-h-[52px] flex-wrap items-stretch gap-1 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-lg shadow-slate-900/5 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-200 sm:flex-nowrap sm:rounded-full">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:min-w-[140px]">
                <Icon name="search" className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search anything…"
                  aria-label="Search"
                  className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>

              <div className="hidden h-8 w-px self-center bg-slate-200 sm:block" />

              <div className="relative min-w-[130px] shrink-0 px-1 sm:max-w-[155px]">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => onCategoryChange(e.target.value || null)}
                  aria-label="Category filter"
                  className="h-full w-full cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pr-8 pl-2 text-sm font-medium text-slate-700 outline-none sm:rounded-none sm:border-0"
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
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
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
