export const SHARK_PATH =
  "M63 17C60 14 56 12 50 11L40 10L32 1.5L29.5 10L18 11.5C13 12 10 13 8 14L1.5 4L4.5 15.5L1.5 28L8.5 18C12 19.5 16 20.5 22 21L34 21.5L30 29L41 21.5L52 21C57 20.5 60.5 19 63 17Z";

export function SharkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sharkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d={SHARK_PATH} fill="url(#sharkGrad)" />
      <circle cx="55" cy="15" r="1.2" fill="#0f1533" />
      <path d="M47 13.5v5M45 13.2v5.4M43 13v5.6" stroke="#0f1533" strokeWidth="0.9" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <SharkIcon className="h-8 w-16 drop-shadow-[0_0_10px_rgba(251,191,36,0.55)]" />
      <div className="leading-none">
        <div className="font-display text-lg font-black tracking-[0.14em] text-white">
          SHARK<span className="text-amber-400"> TUBE</span>
        </div>
        <div className="mt-1 whitespace-nowrap text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-sky-300/70">
          Calculadora de tubulação
        </div>
      </div>
    </div>
  );
}
