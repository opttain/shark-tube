interface IconProps {
  className?: string;
}

const PIPE = "#c7ccdb";
const DIM = "#ef4444";
const ACCENT = "#f5a524";
const GREEN = "#22c55e";
const MUTED = "#8b90a8";

function Pipe({ d }: { d: string }) {
  return (
    <>
      <path d={d} stroke={PIPE} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#0f1533" strokeWidth={2} strokeDasharray="1 6" strokeLinecap="round" />
    </>
  );
}

/** ÂNGULO / DESVIO — um único joelho, ângulo e desvio marcados como incógnita */
export function AngleOffsetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      <Pipe d="M10 120 H70 L150 40 H210" />
      <path d="M70 120 A 30 30 0 0 0 96 101" stroke={ACCENT} strokeWidth={4} />
      <text x="80" y="112" fill={ACCENT} fontSize="16" fontWeight="700">
        ?
      </text>
      <line
        x1="196"
        y1="40"
        x2="196"
        y2="120"
        stroke={DIM}
        strokeWidth={3}
        markerStart="url(#arrowA)"
        markerEnd="url(#arrowA)"
      />
      <text x="200" y="84" fill={DIM} fontSize="16" fontWeight="700">
        ?
      </text>
      <defs>
        <marker id="arrowA" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke={DIM} strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

/** 45 GRAUS — mesmo joelho, mas com o ângulo travado e identificado */
export function FortyFiveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      <Pipe d="M10 120 H70 L150 40 H210" />
      <path d="M70 120 A 30 30 0 0 0 96 101" stroke={GREEN} strokeWidth={4} />
      <text x="72" y="100" fill={GREEN} fontSize="15" fontWeight="700">
        45°
      </text>
      <line
        x1="196"
        y1="40"
        x2="196"
        y2="120"
        stroke={MUTED}
        strokeWidth={1.5}
        markerStart="url(#arrow45)"
        markerEnd="url(#arrow45)"
      />
      <defs>
        <marker id="arrow45" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke={MUTED} strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

/** DESVIO X Y — desvio combinado em dois eixos horizontais ao mesmo tempo */
export function RollingOffsetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      {/* tubo principal: entra reto, desvia em X e Y ao mesmo tempo, sai reto */}
      <Pipe d="M20 60 H60 L140 130 H200" />
      <line x1="60" y1="40" x2="60" y2="60" stroke={DIM} strokeWidth={2.5} markerEnd="url(#arrowXY)" />
      <text x="40" y="34" fill={DIM} fontSize="14" fontWeight="700">
        X
      </text>
      <line x1="160" y1="110" x2="160" y2="130" stroke={DIM} strokeWidth={2.5} markerEnd="url(#arrowXY)" />
      <text x="168" y="150" fill={DIM} fontSize="14" fontWeight="700">
        Y
      </text>
      <defs>
        <marker id="arrowXY" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke={DIM} strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

/** CURVA SEGMENTADA — vários gomos retos cortados em ângulo, juntas visíveis */
export function SegmentedBendIcon({ className }: IconProps) {
  const pts = [
    [20, 140],
    [20, 95],
    [55, 60],
    [110, 45],
    [165, 45],
  ];
  const d = `M${pts.map((p) => p.join(",")).join(" L")}`;
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      <Pipe d={d} />
      {/* marcas de corte nas juntas internas */}
      {[1, 2, 3].map((i) => {
        const [x, y] = pts[i];
        const [px, py] = pts[i - 1];
        const [nx, ny] = pts[i + 1];
        const ang1 = Math.atan2(y - py, x - px);
        const ang2 = Math.atan2(ny - y, nx - x);
        const mid = (ang1 + ang2) / 2 + Math.PI / 2;
        const hw = 9;
        return (
          <g key={i}>
            <line
              x1={x - hw * Math.cos(mid)}
              y1={y - hw * Math.sin(mid)}
              x2={x + hw * Math.cos(mid)}
              y2={y + hw * Math.sin(mid)}
              stroke="#0b0f2b"
              strokeWidth={3}
            />
            <circle cx={x} cy={y} r={3} fill={GREEN} />
          </g>
        );
      })}
    </svg>
  );
}

/** FRAÇÕES — trena/régua graduada com marcações fracionadas */
export function FractionIcon({ className }: IconProps) {
  const ticks = Array.from({ length: 17 }, (_, i) => i);
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      <rect x="15" y="65" width="190" height="26" rx="4" fill="#dfe3ee" />
      {ticks.map((i) => {
        const x = 20 + i * 11.5;
        const tall = i % 4 === 0;
        const med = i % 2 === 0;
        const h = tall ? 20 : med ? 14 : 9;
        return (
          <line
            key={i}
            x1={x}
            y1={65}
            x2={x}
            y2={65 + h}
            stroke="#1c234f"
            strokeWidth={tall ? 2 : 1.3}
          />
        );
      })}
      <text x="22" y="120" fill={DIM} fontSize="20" fontWeight="700">
        1/2
      </text>
      <text x="140" y="55" fill={GREEN} fontSize="18" fontWeight="700">
        3/4"
      </text>
    </svg>
  );
}

/** DIMENSÕES DE TUBO — vista de topo do tubo (círculo) com diâmetro e raio cotados */
export function DimensionsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      <circle cx="110" cy="80" r="55" stroke={PIPE} strokeWidth={10} />
      <circle cx="110" cy="80" r="55" stroke="#0f1533" strokeWidth={10} strokeDasharray="0 1" opacity={0} />
      <circle cx="110" cy="80" r="36" stroke={MUTED} strokeWidth={1.5} strokeDasharray="3 4" />
      {/* diâmetro */}
      <line
        x1="55"
        y1="80"
        x2="165"
        y2="80"
        stroke={DIM}
        strokeWidth={2}
        markerStart="url(#arrowD)"
        markerEnd="url(#arrowD)"
      />
      <text x="88" y="73" fill={DIM} fontSize="15" fontWeight="700">
        ⌀
      </text>
      {/* raio */}
      <line x1="110" y1="80" x2="110" y2="44" stroke={GREEN} strokeWidth={2} markerEnd="url(#arrowD2)" />
      <text x="114" y="58" fill={GREEN} fontSize="13" fontWeight="700">
        R
      </text>
      <defs>
        <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke={DIM} strokeWidth="1" />
        </marker>
        <marker id="arrowD2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke={GREEN} strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

/** DESVIO 3D — gizmo de três eixos com o tubo saindo do plano */
export function Offset3DIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      {/* eixos */}
      <line x1="40" y1="130" x2="40" y2="30" stroke={MUTED} strokeWidth={2} markerEnd="url(#ax3a)" />
      <text x="22" y="28" fill={MUTED} fontSize="13" fontWeight="700">
        A
      </text>
      <line x1="40" y1="130" x2="130" y2="130" stroke={MUTED} strokeWidth={2} markerEnd="url(#ax3a)" />
      <text x="134" y="140" fill={MUTED} fontSize="13" fontWeight="700">
        B
      </text>
      <line x1="40" y1="130" x2="95" y2="155" stroke={MUTED} strokeWidth={2} markerEnd="url(#ax3a)" />
      <text x="90" y="156" fill={MUTED} fontSize="13" fontWeight="700" textAnchor="end">
        C
      </text>
      {/* tubo saindo do canto para um ponto fora do plano */}
      <Pipe d="M40 130 L150 58" />
      <circle cx="150" cy="58" r="5" fill={ACCENT} />
      <defs>
        <marker id="ax3a" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke={MUTED} strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

/** TEE / BOCA DE LOBO — conexão em T clássica, ramal perpendicular ao principal */
export function TeeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      <Pipe d="M15 80 H205" />
      <Pipe d="M110 80 V20" />
      {/* marca de corte onde o ramal encontra o principal */}
      <ellipse cx="110" cy="80" rx="10" ry="5" fill="none" stroke="#0b0f2b" strokeWidth={2} />
      <circle cx="110" cy="80" r="3" fill={GREEN} />
    </svg>
  );
}
