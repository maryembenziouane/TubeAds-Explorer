// Bottom-of-home reassurance strip — mirrors the four-pill row in the
// reference mockup (Safe & secure, Trusted community, Great deals, Easy to use).
const ITEMS = [
  {
    id: 'safe',
    title: 'Safe & secure',
    body: 'Your safety is our priority',
    tone: 'bg-emerald-50 text-emerald-600',
    icon: ShieldIcon,
  },
  {
    id: 'community',
    title: 'Trusted community',
    body: 'Join thousands of happy users',
    tone: 'bg-violet-50 text-violet-600',
    icon: UsersIcon,
  },
  {
    id: 'deals',
    title: 'Great deals',
    body: 'Find the best prices near you',
    tone: 'bg-amber-50 text-amber-600',
    icon: TagIcon,
  },
  {
    id: 'easy',
    title: 'Easy to use',
    body: 'Browse and find in seconds',
    tone: 'bg-sky-50 text-sky-600',
    icon: ChatIcon,
  },
];

export default function TrustStrip() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        {ITEMS.map((item) => {
          const I = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3">
              <span
                className={
                  'grid place-items-center w-10 h-10 rounded-xl shrink-0 ' +
                  item.tone
                }
              >
                <I className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 truncate">{item.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21.5 20a4.5 4.5 0 0 0-7-3.7" />
    </svg>
  );
}
function TagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M3 12V4h8l10 10-8 8L3 12Z" />
      <circle cx="8" cy="8" r="1.6" />
    </svg>
  );
}
function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M4 6h16v11H8l-4 4V6Z" />
      <path d="M8 11h8M8 14h5" />
    </svg>
  );
}
