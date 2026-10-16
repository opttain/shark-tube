interface NumericKeypadProps {
  onKey: (key: string) => void;
}

const ROWS = [
  ["1", "2", "3", "del"],
  ["4", "5", "6", "0"],
  ["7", "8", "9", "."],
];

/** Teclado numérico próprio, botões grandes para usar com luva. */
export function NumericKeypad({ onKey }: NumericKeypadProps) {
  return (
    <div
      className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-[#0a0f26]/70 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      data-testid="numeric-keypad"
    >
      {ROWS.flat().map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          className={`rounded-xl py-4 font-display text-2xl font-semibold transition active:scale-95 active:shadow-[0_0_18px_rgba(56,189,248,0.6)] ${
            key === "del"
              ? "border border-amber-400/40 bg-amber-400/10 text-base uppercase tracking-widest text-amber-300"
              : "border border-white/10 bg-gradient-to-b from-[#26306b] to-[#1a2152] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
