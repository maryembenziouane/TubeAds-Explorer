// Bottom trust bar — French copy aligned with marketplace reassurance (Avito-style).
const ITEMS = [
  {
    id: 'pay',
    title: 'Paiement sécurisé',
    body: 'Transactions protégées',
    tone: 'bg-emerald-50 text-emerald-600',
    icon: CardIcon,
  },
  {
    id: 'ship',
    title: 'Livraison disponible',
    body: 'Retrait ou envoi selon l’annonce',
    tone: 'bg-sky-50 text-sky-600',
    icon: TruckIcon,
  },
  {
    id: 'support',
    title: 'Support client',
    body: 'Une équipe à votre écoute',
    tone: 'bg-violet-50 text-violet-600',
    icon: HeadsetIcon,
  },
  {
    id: 'sellers',
    title: 'Vendeurs actifs',
    body: 'Boutiques et particuliers',
    tone: 'bg-amber-50 text-amber-600',
    icon: UsersIcon,
  },
];

export default function TrustStrip() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
        {ITEMS.map((item) => {
          const I = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3">
              <span
                className={'grid h-11 w-11 shrink-0 place-items-center rounded-xl ' + item.tone}
              >
                <I className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{item.title}</div>
                <div className="truncate text-xs text-slate-500">{item.body}</div>
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

function CardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function TruckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M10 17h8V8H2v9h3" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
      <path d="M14 8V5h4l3 3v10" />
    </svg>
  );
}

function HeadsetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M4 14v3a2 2 0 0 0 2 2h1" />
      <path d="M20 14v3a2 2 0 0 1-2 2h-1" />
      <path d="M5 14V9a7 7 0 0 1 14 0v5" />
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
