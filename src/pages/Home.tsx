import { Link } from "react-router-dom";
import {
  AngleOffsetIcon,
  FortyFiveIcon,
  RollingOffsetIcon,
  SegmentedBendIcon,
  FractionIcon,
  DimensionsIcon,
  Offset3DIcon,
  TeeIcon,
} from "../components/CardIcons";
import type { ComponentType } from "react";

interface CardDef {
  to: string;
  title: string;
  Icon: ComponentType<{ className?: string }>;
}

const cards: CardDef[] = [
  { to: "/offset", title: "ÂNGULO / DESVIO", Icon: AngleOffsetIcon },
  { to: "/offset?angle=45", title: "45 GRAUS", Icon: FortyFiveIcon },
  { to: "/rolling-offset", title: "DESVIO X Y", Icon: RollingOffsetIcon },
  { to: "/segmented-bend", title: "CURVA SEGMENTADA", Icon: SegmentedBendIcon },
  { to: "/fractions", title: "FRAÇÕES", Icon: FractionIcon },
  { to: "/dimensions", title: "DIMENSÕES DE TUBO", Icon: DimensionsIcon },
  { to: "/offset-3d", title: "DESVIO 3D", Icon: Offset3DIcon },
  { to: "/tee", title: "TEE / BOCA DE LOBO", Icon: TeeIcon },
];

export function Home() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Escolha o cálculo</h1>
        <p className="mt-1 text-sm text-slate-400">Ferramentas de traçado e corte para tubulação industrial.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <Link
            key={card.to}
            to={card.to}
            className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-sky-400/15 bg-gradient-to-b from-[#1c2660]/80 to-[#0f1533]/90 p-3 text-center shadow-[0_10px_30px_-14px_rgba(0,0,0,0.8)] transition active:scale-95 hover:border-sky-400/50 hover:shadow-[0_0_28px_-8px_rgba(56,189,248,0.6)]"
          >
            <span className="absolute left-2.5 top-2 font-display text-[0.6rem] font-bold tracking-widest text-sky-300/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
            <card.Icon className="h-24 w-full drop-shadow-[0_0_8px_rgba(56,189,248,0.25)]" />
            <span className="mt-2 font-display text-[0.7rem] font-bold tracking-[0.12em] text-slate-100">
              {card.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
