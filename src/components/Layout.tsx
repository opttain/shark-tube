import { Link, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { Logo } from "./Logo";

export function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-dvh text-white">
      <header className="sticky top-0 z-20 border-b border-sky-400/15 bg-[#1c234f]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" aria-label="Shark Tube — início">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/dimensions"
              aria-label="Dimensões de tubo"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_14px_-4px_rgba(34,197,94,0.8)]"
            >
              <CalculatorIcon />
            </Link>
            {!isHome && (
              <Link
                to="/"
                aria-label="Início"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_14px_-4px_rgba(251,191,36,0.8)]"
              >
                <HomeIcon />
              </Link>
            )}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h12V4H6zm0 6v2h2v-2H6zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H6zm4 0v2h2v-2h-2zm4 0v6h2v-6h-2zm-8 4v2h2v-2H6zm4 0v2h2v-2h-2z" />
    </svg>
  );
}
