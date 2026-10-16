import type { ReactNode } from "react";

interface KeypadFieldProps {
  label: string;
  value: string;
  active: boolean;
  onActivate: () => void;
  icon?: ReactNode;
  hint?: string;
}

/** Campo do teclado dedicado: o valor acende (verde + brilho azul) quando ativo. */
export function KeypadField({ label, value, active, onActivate, icon, hint }: KeypadFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-[0.72rem] font-semibold uppercase leading-tight tracking-[0.12em] text-[#93a4c8]">
        {label}
      </span>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          aria-label={label}
          onClick={onActivate}
          className={`relative w-full overflow-hidden rounded-xl px-4 py-3 text-left font-mono text-lg font-semibold tracking-wider transition ${
            active
              ? "bg-lime-100 text-slate-900 ring-2 ring-sky-400 shadow-[0_0_22px_rgba(56,189,248,0.6)]"
              : "border border-white/10 bg-[#0a0f26]/80 text-slate-100"
          }`}
        >
          {value || " "}
          {active && (
            <span className="absolute right-3 top-1/2 h-5 w-0.5 -translate-y-1/2 animate-pulse bg-sky-500" />
          )}
        </button>
        {hint && <div className="mt-1 pl-1 text-xs text-slate-500">{hint}</div>}
      </div>
      {icon && <div className="h-14 w-14 shrink-0">{icon}</div>}
    </div>
  );
}
