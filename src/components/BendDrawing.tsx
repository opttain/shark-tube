import { buildSegmentedBendPath, OffsetSolverError } from "../lib/pipeMath";

interface BendDrawingProps {
  totalAngleDeg: number;
  numberOfPieces: number;
  diameterMm: number;
  radiusMm: number;
}

type Pt = { x: number; y: number };

function fmt(n: number, digits = 1) {
  return n.toFixed(digits);
}
function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
/** mantém o texto legível (nunca de cabeça para baixo) */
function readableRotation(deg: number) {
  let r = deg % 360;
  while (r > 90) r -= 180;
  while (r <= -90) r += 180;
  return r;
}
/** ponto num círculo de raio r ao redor de center, ângulo "matemático" (0=direita, 90=cima), em espaço já-SVG (y para baixo) */
function polarSvg(center: Pt, r: number, mathAngleDeg: number): Pt {
  const rad = toRad(mathAngleDeg);
  return { x: center.x + r * Math.cos(rad), y: center.y - r * Math.sin(rad) };
}
/** offset em espaço matemático (y para cima) */
function polarMath(center: Pt, r: number, mathAngleDeg: number): Pt {
  const rad = toRad(mathAngleDeg);
  return { x: center.x + r * Math.cos(rad), y: center.y + r * Math.sin(rad) };
}

/**
 * Desenho técnico da curva segmentada: (1) vista de cima com os cortes
 * angulares coloridos, (2) tubo renderizado como faixa sólida sombreada,
 * com marcas de corte, leque + arco do ângulo, e cotas em vermelho.
 */
export function BendDrawing({ totalAngleDeg, numberOfPieces, diameterMm, radiusMm }: BendDrawingProps) {
  let path;
  try {
    path = buildSegmentedBendPath({ totalAngleDeg, numberOfPieces, centerlineRadius: radiusMm });
  } catch (e) {
    return (
      <div className="rounded-xl bg-red-950 p-4 text-sm text-red-300">
        {e instanceof OffsetSolverError ? e.message : "Não foi possível gerar o desenho."}
      </div>
    );
  }

  const { points, pieces, cutAngleDeg } = path;
  const numJoints = pieces.length - 1;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const marginLeft = 90;
  const marginRight = 70;
  const marginTop = 78;
  const marginBottom = 70;
  const viewW = 400;
  const viewH = 480;
  const drawW = viewW - marginLeft - marginRight;
  const drawH = viewH - marginTop - marginBottom;

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = Math.min(drawW / spanX, drawH / spanY);

  function toSvg(p: Pt): Pt {
    return {
      x: marginLeft + (p.x - minX) * scale,
      y: marginTop + (maxY - p.y) * scale,
    };
  }

  const pipeHalfWidthMath = Math.max(diameterMm * 0.24, radiusMm * 0.03);

  // polígono da "faixa" do tubo (contorno sólido), em espaço matemático
  const leftEdge: Pt[] = [];
  const rightEdge: Pt[] = [];
  const highlightLine: Pt[] = [];
  for (let i = 0; i < points.length; i++) {
    let normalDeg: number;
    let halfWidth = pipeHalfWidthMath;
    if (i === 0) normalDeg = pieces[0].directionDeg + 90;
    else if (i === points.length - 1) normalDeg = pieces[pieces.length - 1].directionDeg + 90;
    else {
      normalDeg = (pieces[i - 1].directionDeg + pieces[i].directionDeg) / 2 + 90;
      // extensão correta de junta em esquadria (miter join): o vértice da
      // faixa precisa se afastar mais do que a meia-largura simples, na
      // proporção 1/cos(ângulo de corte), senão sobra uma folga no canto
      // externo da curva
      halfWidth = pipeHalfWidthMath / Math.cos(toRad(cutAngleDeg));
    }
    leftEdge.push(polarMath(points[i], halfWidth, normalDeg));
    rightEdge.push(polarMath(points[i], halfWidth, normalDeg + 180));
    highlightLine.push(polarMath(points[i], halfWidth * 0.45, normalDeg));
  }
  const bandSvg = [...leftEdge.map(toSvg), ...rightEdge.map(toSvg).reverse()];
  const bandPathD =
    bandSvg.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  const svgPoints = points.map(toSvg);

  // cada gomo é um quadrilátero próprio, com gradiente perpendicular ao seu
  // eixo — é isso que dá a leitura de cilindro metálico em vez de faixa plana
  const segments = pieces.map((_, k) => {
    const l0 = toSvg(leftEdge[k]);
    const l1 = toSvg(leftEdge[k + 1]);
    const r1 = toSvg(rightEdge[k + 1]);
    const r0 = toSvg(rightEdge[k]);
    const d = `M${l0.x},${l0.y} L${l1.x},${l1.y} L${r1.x},${r1.y} L${r0.x},${r0.y} Z`;
    const gFrom = { x: (l0.x + l1.x) / 2, y: (l0.y + l1.y) / 2 };
    const gTo = { x: (r0.x + r1.x) / 2, y: (r0.y + r1.y) / 2 };
    return { d, gFrom, gTo };
  });
  const highlightD = highlightLine
    .map(toSvg)
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const centerlineD = svgPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // "bocas" elípticas nas pontas abertas do tubo, para sugerir a seção
  // circular (o mesmo truque visual de desenhos técnicos de tubulação)
  const pipeHalfWidthPx = pipeHalfWidthMath * scale;
  const capSquash = 0.4;
  function endCap(pt: Pt, directionDeg: number) {
    const rotation = -(directionDeg + 90);
    return { cx: pt.x, cy: pt.y, rx: pipeHalfWidthPx, ry: pipeHalfWidthPx * capSquash, rotation };
  }
  const startCap = endCap(svgPoints[0], pieces[0].directionDeg);
  const endCapProps = endCap(svgPoints[svgPoints.length - 1], pieces[pieces.length - 1].directionDeg);

  const dim = "#ef4444";
  const totalRun = spanX;
  const totalRise = spanY;
  const totalDeveloped = pieces.reduce((sum, p) => sum + p.length, 0);

  const bottomDimY = marginTop + drawH + 30;
  const rightDimX = marginLeft + drawW + 30;

  const stepDeg = 2 * cutAngleDeg;
  // valor de avanço de "meia peça" (R * tan(ângulo de corte)) — mesmo valor
  // usado nas peças de ponta e em cada metade das peças interiores
  const halfAdvance = pieces[0].length;

  // badge do ângulo de giro na 1ª junta (mostra o ângulo de peça para
  // peça, igual ao valor visto na vista de cima)
  const joint1 = svgPoints[1];
  const badgeRadius = 40;
  const dirIn = pieces[0].directionDeg;
  const dirOut = pieces[1] ? pieces[1].directionDeg : dirIn;
  const arcMidAngle = (dirIn + 180 + dirOut + 180) / 2;
  const badgePos = polarSvg(joint1, Math.max(badgeRadius, pipeHalfWidthPx * 1.6) + 26, arcMidAngle);

  // cotas em arco (comprimento de arco externo/interno de uma junta):
  // arco = raio * ângulo(rad). Usa-se o raio externo (R+D/2) para a última
  // peça e o raio interno (R-D/2) para a primeira, no mesmo estilo do
  // desenho de referência.
  const outerRadiusMm = radiusMm + diameterMm / 2;
  const innerRadiusMm = Math.max(radiusMm - diameterMm / 2, 0);
  const stepRad = toRad(stepDeg);
  const outerArcLen = outerRadiusMm * stepRad;
  const innerArcLen = innerRadiusMm * stepRad;

  function bowedPath(a: Pt, b: Pt, bow: number, outwardDeg: number) {
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const ctrl = polarSvg(mid, bow, outwardDeg);
    return { d: `M${a.x},${a.y} Q${ctrl.x},${ctrl.y} ${b.x},${b.y}`, ctrl };
  }
  const lastPieceIdx = pieces.length - 1;
  const outerArcCurve = bowedPath(
    toSvg(leftEdge[lastPieceIdx]),
    toSvg(leftEdge[lastPieceIdx + 1]),
    14,
    pieces[lastPieceIdx].directionDeg + 90,
  );
  const innerArcCurve = bowedPath(
    toSvg(rightEdge[0]),
    toSvg(rightEdge[1]),
    12,
    pieces[0].directionDeg - 90,
  );

  // --- vista de cima (mini diagrama com os cortes angulares) ---
  const topViewH = 170;
  const topCenter: Pt = { x: 200, y: topViewH - 20 };
  const outerR = 120;
  const innerR = Math.max(outerR * (innerRadiusMm / outerRadiusMm), 20);
  const topColors = ["#4b5170", "#22c55e"];
  const halfTotalDeg = totalAngleDeg / 2;
  const wedgeStartDeg = 90 + halfTotalDeg;
  const wedges = Array.from({ length: numJoints }, (_, i) => {
    const a0 = wedgeStartDeg - i * stepDeg;
    const a1 = wedgeStartDeg - (i + 1) * stepDeg;
    const o0 = polarSvg(topCenter, outerR, a0);
    const o1 = polarSvg(topCenter, outerR, a1);
    const i1 = polarSvg(topCenter, innerR, a1);
    const i0 = polarSvg(topCenter, innerR, a0);
    const mid = polarSvg(topCenter, (outerR + innerR) / 2, (a0 + a1) / 2);
    const d = `M${o0.x},${o0.y} A${outerR},${outerR} 0 0,1 ${o1.x},${o1.y} L${i1.x},${i1.y} A${innerR},${innerR} 0 0,0 ${i0.x},${i0.y} Z`;
    return { d, mid, color: topColors[i % topColors.length] };
  });
  const outerEdgeStart = polarSvg(topCenter, outerR, wedgeStartDeg);
  const innerEdgeStart = polarSvg(topCenter, innerR, wedgeStartDeg);
  const outerEdgeEnd = polarSvg(topCenter, outerR, wedgeStartDeg - numJoints * stepDeg);
  const innerEdgeEnd = polarSvg(topCenter, innerR, wedgeStartDeg - numJoints * stepDeg);

  // cotas verticais laterais: projeção vertical do raio externo (ponta
  // direita, junto do último gomo) e do raio interno (ponta esquerda,
  // junto do primeiro gomo) — casa exatamente com os valores do desenho
  // de referência (raio*cos(ângulo total/2))
  const rightDimPt = outerEdgeEnd;
  const leftDimPt = innerEdgeStart;
  const rightSideDimVal = outerRadiusMm * Math.cos(toRad(halfTotalDeg));
  const leftSideDimVal = innerRadiusMm * Math.cos(toRad(halfTotalDeg));

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-400/20 bg-gradient-to-b from-[#1c2660] to-[#141b4a] shadow-[0_0_40px_-16px_rgba(56,189,248,0.6)]">
      <svg viewBox={`0 0 400 ${topViewH}`} className="w-full border-b border-sky-400/15">
        <defs>
          <marker id="dimArrowSm" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={dim} />
          </marker>
        </defs>
        {wedges.map((w, i) => (
          <g key={i}>
            <path d={w.d} fill={w.color} stroke="#0b0f2b" strokeWidth={1.5} />
            <text x={w.mid.x} y={w.mid.y} textAnchor="middle" fontSize="13" fontWeight="700" fill="#e5e7eb">
              {fmt(stepDeg)}°
            </text>
          </g>
        ))}
        {/* linha tracejada radial de fronteira externa/interna */}
        <line
          x1={outerEdgeStart.x}
          y1={outerEdgeStart.y}
          x2={innerEdgeStart.x}
          y2={innerEdgeStart.y}
          stroke="#e5e7eb"
          strokeDasharray="3 3"
        />
        <line
          x1={outerEdgeEnd.x}
          y1={outerEdgeEnd.y}
          x2={innerEdgeEnd.x}
          y2={innerEdgeEnd.y}
          stroke="#e5e7eb"
          strokeDasharray="3 3"
        />

        {/* cota vertical esquerda: raio interno * cos(ângulo total / 2) */}
        <line
          x1={leftDimPt.x}
          y1={topCenter.y}
          x2={leftDimPt.x}
          y2={leftDimPt.y}
          stroke={dim}
          strokeWidth={1.3}
          markerStart="url(#dimArrowSm)"
          markerEnd="url(#dimArrowSm)"
        />
        <text x={leftDimPt.x - 8} y={(topCenter.y + leftDimPt.y) / 2} fontSize="12" fill={dim} textAnchor="end">
          {fmt(leftSideDimVal)}
        </text>

        {/* cota vertical direita: raio externo * cos(ângulo total / 2) */}
        <line
          x1={rightDimPt.x}
          y1={topCenter.y}
          x2={rightDimPt.x}
          y2={rightDimPt.y}
          stroke={dim}
          strokeWidth={1.3}
          markerStart="url(#dimArrowSm)"
          markerEnd="url(#dimArrowSm)"
        />
        <text x={rightDimPt.x + 8} y={(topCenter.y + rightDimPt.y) / 2} fontSize="12" fill={dim}>
          {fmt(rightSideDimVal)}
        </text>

        {/* ícone decorativo de morsa/fixação, como no desenho de referência */}
        <g transform="translate(340,14)" stroke="#9ca3af" strokeWidth="2" fill="#6b7280">
          <rect x="-3" y="0" width="6" height="34" rx="2" />
          <rect x="-16" y="30" width="30" height="8" rx="2" />
          <path d="M10,4 L30,-8" stroke="#9ca3af" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </svg>

      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full">
        <defs>
          {segments.map((seg, k) => (
            <linearGradient
              key={k}
              id={`bdSteel${k}`}
              gradientUnits="userSpaceOnUse"
              x1={seg.gFrom.x}
              y1={seg.gFrom.y}
              x2={seg.gTo.x}
              y2={seg.gTo.y}
            >
              <stop offset="0%" stopColor="#4a5070" />
              <stop offset="9%" stopColor="#9aa1b9" />
              <stop offset="26%" stopColor="#f8fafc" />
              <stop offset="38%" stopColor="#d9dde8" />
              <stop offset="58%" stopColor="#8a90a8" />
              <stop offset="80%" stopColor="#5a607c" />
              <stop offset="90%" stopColor="#7c829c" />
              <stop offset="100%" stopColor="#363c58" />
            </linearGradient>
          ))}
          <linearGradient id="bdRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5a607c" />
            <stop offset="35%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#6b7190" />
          </linearGradient>
          <radialGradient id="bdBore" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#05070f" />
            <stop offset="65%" stopColor="#141a36" />
            <stop offset="100%" stopColor="#3b4263" />
          </radialGradient>
          <filter id="bdShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="bdSoft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <pattern id="bdGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgba(148,163,255,0.08)" strokeWidth="1" />
          </pattern>
          <marker id="dimArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={dim} />
          </marker>
        </defs>

        <rect width={viewW} height={viewH} fill="url(#bdGrid)" />

        {/* sombra projetada do tubo */}
        <path d={bandPathD} fill="rgba(0,0,0,0.55)" transform="translate(7 10)" filter="url(#bdShadow)" />

        {/* gomos com sombreamento cilíndrico */}
        {segments.map((seg, k) => (
          <path key={k} d={seg.d} fill={`url(#bdSteel${k})`} />
        ))}
        {/* reflexo especular contínuo ao longo do tubo */}
        <path
          d={highlightD}
          stroke="#ffffff"
          strokeOpacity={0.55}
          strokeWidth={Math.max(pipeHalfWidthPx * 0.12, 1.5)}
          strokeLinecap="round"
          fill="none"
          filter="url(#bdSoft)"
        />
        <path d={bandPathD} fill="none" stroke="#0b0f2b" strokeWidth={1.6} strokeLinejoin="round" />

        {/* bocas com espessura de parede: anel metálico + furo escuro */}
        {[startCap, endCapProps].map((cap, k) => (
          <g key={k} transform={`rotate(${cap.rotation} ${cap.cx} ${cap.cy})`}>
            <ellipse cx={cap.cx} cy={cap.cy} rx={cap.rx} ry={cap.ry} fill="url(#bdRim)" stroke="#0b0f2b" strokeWidth={1.4} />
            <ellipse cx={cap.cx} cy={cap.cy} rx={cap.rx * 0.8} ry={cap.ry * 0.8} fill="url(#bdBore)" />
            <ellipse
              cx={cap.cx}
              cy={cap.cy - cap.ry * 0.05}
              rx={cap.rx * 0.8}
              ry={cap.ry * 0.8}
              fill="none"
              stroke="#0b0f2b"
              strokeOpacity={0.6}
              strokeWidth={1}
            />
          </g>
        ))}

        {/* linha de centro tracejada, com setas nas pontas (comprimento total) */}
        <path
          d={centerlineD}
          stroke="#1e3a8a"
          strokeOpacity={0.85}
          strokeWidth={1.5}
          strokeDasharray="6 5"
          fill="none"
          markerStart="url(#dimArrow)"
          markerEnd="url(#dimArrow)"
        />
        {/* marcas de corte (juntas), alinhadas com a borda real da faixa */}
        {Array.from({ length: numJoints }, (_, i) => {
          const idx = i + 1;
          const l = toSvg(leftEdge[idx]);
          const r = toSvg(rightEdge[idx]);
          const jp = svgPoints[idx];
          return (
            <g key={i}>
              <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke="#1f2440" strokeWidth={7} strokeLinecap="round" />
              <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke="#a3a9c0" strokeWidth={4} strokeDasharray="2 2.4" strokeLinecap="round" />
              <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1} />
              <circle cx={jp.x} cy={jp.y} r={4} fill="#22c55e" stroke="#0b0f2b" strokeWidth={1} />
            </g>
          );
        })}

        {/* badge do ângulo de giro entre peças (mesmo valor da vista de cima) */}
        <circle cx={badgePos.x} cy={badgePos.y} r={20} fill="#fbbf24" stroke="#0b0f2b" strokeWidth={1.5} />
        <text x={badgePos.x} y={badgePos.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0b0f2b">
          {fmt(stepDeg)}°
        </text>

        {/* cotas em arco externa/interna — só fazem sentido (e cabem sem
            colidir com o rótulo da peça) quando há pelo menos uma peça
            interior, ou seja, 3+ peças */}
        {pieces.length > 2 && (
          <>
            <path d={outerArcCurve.d} stroke={dim} strokeWidth={1.2} fill="none" markerStart="url(#dimArrowSm)" markerEnd="url(#dimArrowSm)" />
            <text x={outerArcCurve.ctrl.x} y={outerArcCurve.ctrl.y - 4} textAnchor="middle" fontSize="11" fill={dim}>
              {fmt(outerArcLen)}
            </text>
            <path d={innerArcCurve.d} stroke={dim} strokeWidth={1.2} fill="none" markerStart="url(#dimArrowSm)" markerEnd="url(#dimArrowSm)" />
            <text x={innerArcCurve.ctrl.x} y={innerArcCurve.ctrl.y + 12} textAnchor="middle" fontSize="11" fill={dim}>
              {fmt(innerArcLen)}
            </text>
          </>
        )}

        {/* rótulo de comprimento de cada peça, com setinhas — peças
            interiores são divididas em duas metades (avanço R*tan) com um
            ponto verde no meio, igual ao desenho de referência */}
        {pieces.map((piece, i) => {
          const isInterior = i > 0 && i < pieces.length - 1;
          const p0 = svgPoints[i];
          const p1 = svgPoints[i + 1];
          // com 2 peças a cota vai para o lado interno, longe do selo do ângulo
          const normalDeg = piece.directionDeg + (pieces.length === 2 ? -90 : 90);

          function lengthLabel(from: Pt, to: Pt, value: number, key: string) {
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const labelPt = polarSvg({ x: mx, y: my }, pipeHalfWidthMath * scale + 18, normalDeg);
            const rotation = readableRotation(-piece.directionDeg);
            const segLen = Math.hypot(to.x - from.x, to.y - from.y);
            const arrowHalf = Math.min(segLen, 30) / 2;
            const a0 = polarSvg({ x: mx, y: my }, arrowHalf, piece.directionDeg);
            const a1 = polarSvg({ x: mx, y: my }, arrowHalf, piece.directionDeg + 180);
            const aOff0 = polarSvg(a0, pipeHalfWidthMath * scale + 8, normalDeg);
            const aOff1 = polarSvg(a1, pipeHalfWidthMath * scale + 8, normalDeg);
            return (
              <g key={key}>
                <line
                  x1={aOff0.x}
                  y1={aOff0.y}
                  x2={aOff1.x}
                  y2={aOff1.y}
                  stroke={dim}
                  strokeWidth={1.3}
                  markerStart="url(#dimArrow)"
                  markerEnd="url(#dimArrow)"
                />
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  fontSize="12"
                  fill={dim}
                  transform={`rotate(${rotation} ${labelPt.x} ${labelPt.y})`}
                >
                  {fmt(value)}
                </text>
              </g>
            );
          }

          if (!isInterior) {
            // com só 2 peças não há trecho interior para dividir — mostra
            // o comprimento da peça inteira normalmente
            if (pieces.length === 2) return lengthLabel(p0, p1, piece.length, `${i}`);
            return null;
          }
          const midSvg = toSvg(piece.mid);
          return (
            <g key={i}>
              {lengthLabel(p0, midSvg, halfAdvance, `${i}-a`)}
              {lengthLabel(midSvg, p1, halfAdvance, `${i}-b`)}
              <circle cx={midSvg.x} cy={midSvg.y} r={4} fill="#22c55e" stroke="#0b0f2b" strokeWidth={1} />
            </g>
          );
        })}

        {/* cota: largura total (run) */}
        <line
          x1={marginLeft}
          y1={bottomDimY}
          x2={marginLeft + drawW}
          y2={bottomDimY}
          stroke={dim}
          strokeWidth={1.5}
          markerStart="url(#dimArrow)"
          markerEnd="url(#dimArrow)"
        />
        <text x={marginLeft + drawW / 2} y={bottomDimY + 18} textAnchor="middle" fontSize="14" fill={dim}>
          {fmt(totalRun)}
        </text>

        {/* cota: altura total (rise) */}
        <line
          x1={rightDimX}
          y1={marginTop}
          x2={rightDimX}
          y2={marginTop + drawH}
          stroke={dim}
          strokeWidth={1.5}
          markerStart="url(#dimArrow)"
          markerEnd="url(#dimArrow)"
        />
        <text
          x={rightDimX + 16}
          y={marginTop + drawH / 2}
          textAnchor="middle"
          fontSize="14"
          fill={dim}
          transform={`rotate(90 ${rightDimX + 16} ${marginTop + drawH / 2})`}
        >
          {fmt(totalRise)}
        </text>
      </svg>

      <table className="w-full border-t border-sky-400/15 bg-[#0f1533]/60 text-center text-white">
        <tbody>
          <tr className="border-b border-white/5">
            <td className="border-r border-white/5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#93a4c8]">Diâmetro</td>
            <td className="py-2.5 font-display text-base font-bold text-amber-300">{fmt(diameterMm)}</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="border-r border-white/5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#93a4c8]">Raio</td>
            <td className="py-2.5 font-display text-base font-bold text-amber-300">{fmt(radiusMm)}</td>
          </tr>
          <tr>
            <td className="border-r border-white/5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#93a4c8]">Comprimento total</td>
            <td className="py-2.5 font-display text-base font-bold text-amber-300">{fmt(totalDeveloped)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
