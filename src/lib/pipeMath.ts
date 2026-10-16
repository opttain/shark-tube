// Trigonometria do "triângulo de offset" usado em tubulação:
//
//        Travel (T) = hipotenusa
//       /|
//      / |
//     /  | Offset (O)
//    /θ__|
//    Run (R)
//
// sin(θ) = O / T      tan(θ) = O / R      cos(θ) = R / T

export const COMMON_ANGLES = [11.25, 22.5, 30, 45, 60] as const;

export interface OffsetInputs {
  angleDeg?: number;
  offset?: number;
  travel?: number;
  run?: number;
}

export interface OffsetResult {
  angleDeg: number;
  offset: number;
  travel: number;
  run: number;
  /** multiplicador clássico usado em tabelas de tubulista (cossecante do ângulo) */
  travelConstant: number;
  /** multiplicador clássico para o run (cotangente do ângulo) */
  runConstant: number;
}

export class OffsetSolverError extends Error {}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/**
 * Resolve o triângulo de offset a partir de quaisquer 2 valores conhecidos
 * entre {ângulo, offset (desvio), travel (diagonal), run (avanço)}.
 */
export function solveOffset(inputs: OffsetInputs): OffsetResult {
  const known = Object.entries(inputs).filter(
    ([, v]) => v !== undefined && v !== null && !Number.isNaN(v),
  );

  if (known.length < 2) {
    throw new OffsetSolverError("Informe pelo menos 2 valores conhecidos.");
  }

  const { angleDeg, offset, travel, run } = inputs;

  let a = angleDeg;
  let o = offset;
  let t = travel;
  let r = run;

  if (a !== undefined && o !== undefined) {
    if (a <= 0 || a >= 90) throw new OffsetSolverError("O ângulo deve estar entre 0° e 90°.");
    t = o / Math.sin(toRad(a));
    r = o / Math.tan(toRad(a));
  } else if (a !== undefined && t !== undefined) {
    if (a <= 0 || a >= 90) throw new OffsetSolverError("O ângulo deve estar entre 0° e 90°.");
    o = t * Math.sin(toRad(a));
    r = t * Math.cos(toRad(a));
  } else if (a !== undefined && r !== undefined) {
    if (a <= 0 || a >= 90) throw new OffsetSolverError("O ângulo deve estar entre 0° e 90°.");
    o = r * Math.tan(toRad(a));
    t = r / Math.cos(toRad(a));
  } else if (o !== undefined && t !== undefined) {
    if (o >= t) throw new OffsetSolverError("O desvio não pode ser maior ou igual ao travel.");
    a = toDeg(Math.asin(o / t));
    r = Math.sqrt(t * t - o * o);
  } else if (o !== undefined && r !== undefined) {
    a = toDeg(Math.atan(o / r));
    t = Math.sqrt(o * o + r * r);
  } else if (t !== undefined && r !== undefined) {
    if (r >= t) throw new OffsetSolverError("O run não pode ser maior ou igual ao travel.");
    a = toDeg(Math.acos(r / t));
    o = Math.sqrt(t * t - r * r);
  } else {
    throw new OffsetSolverError("Combinação de valores inválida.");
  }

  if (a === undefined || o === undefined || t === undefined || r === undefined) {
    throw new OffsetSolverError("Não foi possível resolver com os valores informados.");
  }

  return {
    angleDeg: a,
    offset: o,
    travel: t,
    run: r,
    travelConstant: 1 / Math.sin(toRad(a)),
    runConstant: 1 / Math.tan(toRad(a)),
  };
}

export interface RollingOffsetInputs {
  horizontalOffset: number;
  verticalOffset: number;
  angleDeg: number;
}

export interface RollingOffsetResult {
  trueOffset: number;
  rollAngleDeg: number;
  offsetResult: OffsetResult;
}

/**
 * Rolling offset: combina um desvio horizontal e um vertical num único
 * "true offset" (offset verdadeiro), depois resolve o triângulo normal
 * com o ângulo da conexão escolhida.
 */
export function solveRollingOffset({
  horizontalOffset,
  verticalOffset,
  angleDeg,
}: RollingOffsetInputs): RollingOffsetResult {
  if (horizontalOffset <= 0 || verticalOffset <= 0) {
    throw new OffsetSolverError("Os desvios horizontal e vertical devem ser maiores que zero.");
  }
  const trueOffset = Math.sqrt(
    horizontalOffset * horizontalOffset + verticalOffset * verticalOffset,
  );
  const rollAngleDeg = toDeg(Math.atan(verticalOffset / horizontalOffset));

  const offsetResult = solveOffset({ angleDeg, offset: trueOffset });

  return { trueOffset, rollAngleDeg, offsetResult };
}

export interface SegmentedBendInputs {
  totalAngleDeg: number;
  numberOfPieces: number;
  centerlineRadius?: number;
}

export interface SegmentedBendResult {
  numberOfJoints: number;
  cutAngleDeg: number;
  endPieceAdvance?: number;
  interiorPieceAdvance?: number;
}

/**
 * Curva segmentada (mitered/segmented bend): divide um ângulo total de
 * curva em N peças de tubo cortadas em ângulo (gomos).
 */
export function solveSegmentedBend({
  totalAngleDeg,
  numberOfPieces,
  centerlineRadius,
}: SegmentedBendInputs): SegmentedBendResult {
  if (totalAngleDeg <= 0 || totalAngleDeg >= 180) {
    throw new OffsetSolverError("O ângulo total deve estar entre 0° e 180°.");
  }
  if (!Number.isInteger(numberOfPieces) || numberOfPieces < 2) {
    throw new OffsetSolverError("O número de peças deve ser um inteiro maior ou igual a 2.");
  }

  const numberOfJoints = numberOfPieces - 1;
  const cutAngleDeg = totalAngleDeg / (2 * numberOfJoints);

  const result: SegmentedBendResult = { numberOfJoints, cutAngleDeg };

  if (centerlineRadius && centerlineRadius > 0) {
    const advance = centerlineRadius * Math.tan(toRad(cutAngleDeg));
    result.endPieceAdvance = advance;
    result.interiorPieceAdvance = advance * 2;
  }

  return result;
}

export interface Offset3DInputs {
  /** A: altura do desvio (eixo vertical) */
  heightA: number;
  /** B: projeção no eixo X (largura) */
  widthB: number;
  /** C: projeção no eixo Y (comprimento) */
  depthC: number;
  /** raio dos cotovelos usados nas duas pontas */
  radiusMm: number;
}

export interface Offset3DResult {
  /** diagonal teórica, centro a centro do cotovelo 1 ao cotovelo 2 */
  diagonalH: number;
  /** ângulo de giro no plano horizontal (para onde o tubo gira no espaço) */
  muDeg: number;
  /** ângulo de inclinação com a vertical — é o ângulo de corte dos cotovelos */
  alphaDeg: number;
  /** avanço (R * tan(alpha/2)) descontado em cada um dos dois cotovelos */
  advancePerElbow: number;
  /** comprimento real do tubo reto central, já descontando os dois cotovelos */
  straightLength: number;
}

/**
 * Desvio tridimensional ("quiebros con codos" / walking-the-dog em 3D):
 * dado um deslocamento nos 3 eixos (A vertical, B e C horizontais) e o raio
 * dos cotovelos, resolve a diagonal espacial, os dois ângulos (µ de giro
 * horizontal e α de inclinação/corte) e o comprimento real do tubo reto.
 */
export function solve3DOffset({ heightA, widthB, depthC, radiusMm }: Offset3DInputs): Offset3DResult {
  const diagonalH = Math.sqrt(heightA * heightA + widthB * widthB + depthC * depthC);
  if (diagonalH === 0) {
    throw new OffsetSolverError("Informe pelo menos um deslocamento maior que zero.");
  }

  let muDeg: number;
  if (depthC !== 0) {
    muDeg = toDeg(Math.atan(widthB / depthC));
  } else {
    muDeg = widthB > 0 ? 90 : 0;
  }

  const alphaRad = Math.acos(heightA / diagonalH);
  const alphaDeg = toDeg(alphaRad);

  if (radiusMm <= 0) {
    throw new OffsetSolverError("Informe um raio de cotovelo válido.");
  }
  const advancePerElbow = radiusMm * Math.tan(alphaRad / 2);
  const straightLength = diagonalH - 2 * advancePerElbow;

  return { diagonalH, muDeg, alphaDeg, advancePerElbow, straightLength };
}

export interface TeePlanificationInputs {
  /** diâmetro do ramal (tubo que faz a furação) */
  branchDiameter: number;
  /** diâmetro do tubo principal (onde o ramal se conecta) */
  mainDiameter: number;
  /** altura de referência a partir do topo do tubo principal */
  heightRef: number;
  /** ângulo de inclinação do ramal, em graus (90° = perpendicular) */
  angleDeg: number;
  /** deslocamento lateral (excentricidade) do ramal em relação ao eixo do principal */
  offsetT: number;
  /** pontos por quadrante — o gabarito terá 4 * pointsPerQuadrant + 1 pontos */
  pointsPerQuadrant: number;
}

export interface TeePlanificationPoint {
  index: number;
  angleDeg: number;
  x: number;
  y: number;
}

/**
 * Planificação do gabarito de corte de uma conexão em T (boca de lobo):
 * gera os pontos (distância ao redor da circunferência do ramal × altura de
 * corte) que, ligados, formam a curva que deve ser marcada e cortada no
 * tubo ramal para encaixar perfeitamente no tubo principal.
 */
export function solveTeePlanification({
  branchDiameter,
  mainDiameter,
  heightRef,
  angleDeg,
  offsetT,
  pointsPerQuadrant,
}: TeePlanificationInputs): TeePlanificationPoint[] {
  if (branchDiameter <= 0 || mainDiameter <= 0) {
    throw new OffsetSolverError("Informe diâmetros válidos para o ramal e o tubo principal.");
  }
  if (angleDeg <= 0 || angleDeg > 180) {
    throw new OffsetSolverError("O ângulo deve estar entre 0° e 180°.");
  }
  if (!Number.isInteger(pointsPerQuadrant) || pointsPerQuadrant < 1) {
    throw new OffsetSolverError("Pontos por quadrante deve ser um inteiro maior ou igual a 1.");
  }

  const r = branchDiameter / 2;
  const R = mainDiameter / 2;
  const alphaRad = toRad(angleDeg);
  const n = 4 * pointsPerQuadrant;
  const perimeterBranch = Math.PI * branchDiameter;
  const stepX = perimeterBranch / n;

  const points: TeePlanificationPoint[] = [];
  for (let k = 0; k <= n; k++) {
    const theta = (k * 2 * Math.PI) / n;
    const underRoot = R * R - Math.pow(r * Math.sin(theta) + offsetT, 2);
    if (underRoot < 0) {
      throw new OffsetSolverError(
        "O deslocamento ou o diâmetro do ramal são grandes demais para o tubo principal.",
      );
    }
    const z = Math.sqrt(underRoot) / Math.sin(alphaRad);
    const miter = (r * Math.cos(theta)) / Math.tan(alphaRad);
    const y = heightRef + R / Math.sin(alphaRad) - (z - miter);
    points.push({ index: k, angleDeg: (k * 360) / n, x: k * stepX, y });
  }
  return points;
}

export interface BendPathPoint {
  x: number;
  y: number;
}

export interface BendPathPiece {
  length: number;
  /** ponto médio da peça, útil para posicionar o rótulo da cota */
  mid: BendPathPoint;
  /** direção da peça em graus (0 = direita, 90 = cima) */
  directionDeg: number;
}

export interface BendPath {
  points: BendPathPoint[];
  pieces: BendPathPiece[];
  cutAngleDeg: number;
  /** ângulo de partida de cada peça em relação à vertical, no 1º e no último trecho */
}

/**
 * Gera o traçado (linha de centro) de uma curva segmentada de N peças,
 * partindo na vertical e girando em direção à horizontal, para desenho.
 * Reusa a mesma fórmula de solveSegmentedBend (mesmo ângulo de corte).
 */
export function buildSegmentedBendPath({
  totalAngleDeg,
  numberOfPieces,
  centerlineRadius,
}: SegmentedBendInputs): BendPath {
  const { cutAngleDeg, endPieceAdvance, interiorPieceAdvance } = solveSegmentedBend({
    totalAngleDeg,
    numberOfPieces,
    centerlineRadius,
  });

  if (endPieceAdvance === undefined || interiorPieceAdvance === undefined) {
    throw new OffsetSolverError("Informe o raio para desenhar o traçado.");
  }

  const stepDeg = 2 * cutAngleDeg;
  let x = 0;
  let y = 0;
  const points: BendPathPoint[] = [{ x, y }];
  const pieces: BendPathPiece[] = [];

  for (let k = 0; k < numberOfPieces; k++) {
    const length = k === 0 || k === numberOfPieces - 1 ? endPieceAdvance : interiorPieceAdvance;
    const directionDeg = 90 - k * stepDeg;
    const rad = toRad(directionDeg);
    const nx = x + length * Math.cos(rad);
    const ny = y + length * Math.sin(rad);
    pieces.push({
      length,
      mid: { x: (x + nx) / 2, y: (y + ny) / 2 },
      directionDeg,
    });
    x = nx;
    y = ny;
    points.push({ x, y });
  }

  return { points, pieces, cutAngleDeg };
}
