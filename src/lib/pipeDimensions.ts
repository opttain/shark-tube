// Tabela de diâmetros de tubo (NPS/DN) conforme ASME B36.10M / B36.19M
// e raios de curvatura de cotovelos conforme ASME B16.9.
//
// Fonte dos diâmetros externos (OD): tabela padrão da indústria de
// tubulação (a mesma usada mundialmente em projetos de processo).
// Acima de NPS 14", o OD em mm é sempre NPS(pol) × 25.4 por definição
// ("OD size" = o próprio tamanho nominal).

export interface PipeSize {
  /** Rótulo NPS, ex: "1 1/4"" */
  nps: string;
  /** NPS em polegadas decimais, usado nos cálculos */
  npsInches: number;
  /** Diâmetro nominal (DN) em mm */
  dn: number;
  /** Diâmetro externo (OD) em mm */
  odMm: number;
}

const RAW_TABLE: Array<[string, number, number, number]> = [
  ["1/8", 0.125, 6, 10.3],
  ["1/4", 0.25, 8, 13.7],
  ["3/8", 0.375, 10, 17.1],
  ["1/2", 0.5, 15, 21.3],
  ["3/4", 0.75, 20, 26.7],
  ["1", 1, 25, 33.4],
  ["1 1/4", 1.25, 32, 42.2],
  ["1 1/2", 1.5, 40, 48.3],
  ["2", 2, 50, 60.3],
  ["2 1/2", 2.5, 65, 73.0],
  ["3", 3, 80, 88.9],
  ["3 1/2", 3.5, 90, 101.6],
  ["4", 4, 100, 114.3],
  ["5", 5, 125, 141.3],
  ["6", 6, 150, 168.3],
  ["8", 8, 200, 219.1],
  ["10", 10, 250, 273.1],
  ["12", 12, 300, 323.9],
];

// Acima de 14", DN = NPS × 25 (mm) e OD = NPS × 25.4 (mm), por convenção.
const LARGE_SIZES = [14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48];

export const PIPE_SIZES: PipeSize[] = [
  ...RAW_TABLE.map(([nps, npsInches, dn, odMm]) => ({ nps, npsInches, dn, odMm })),
  ...LARGE_SIZES.map((n) => ({
    nps: String(n),
    npsInches: n,
    dn: n * 25,
    odMm: n * 25.4,
  })),
];

export type RadiusKind = "long" | "short";

/** Raio de curvatura (centro à extremidade) de um cotovelo, em mm, conforme ASME B16.9. */
export function elbowRadiusMm(npsInches: number, kind: RadiusKind): number {
  const multiplier = kind === "long" ? 1.5 : 1.0;
  return npsInches * 25.4 * multiplier;
}

export function mmToInch(mm: number): number {
  return mm / 25.4;
}
