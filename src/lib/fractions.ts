// Utilitários para trabalhar com medidas em polegadas fracionárias,
// o padrão usado por tubulistas (ex: 3/8", 1 1/2").

const DEFAULT_DENOMINATOR = 16;

/**
 * Converte uma string de medida em polegadas para número decimal.
 * Aceita: "3/8", "1 1/2", "1-1/2", "0.375", "2"
 */
export function parseInches(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;

  // decimal puro, ex: "1.5"
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // fração pura, ex: "3/8"
  const fractionOnly = trimmed.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fractionOnly) {
    const [, num, den] = fractionOnly;
    const denominator = parseInt(den, 10);
    if (denominator === 0) return null;
    return parseInt(num, 10) / denominator;
  }

  // número misto, ex: "1 1/2" ou "1-1/2"
  const mixed = trimmed.match(/^(-?\d+)[\s-]+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const [, whole, num, den] = mixed;
    const denominator = parseInt(den, 10);
    if (denominator === 0) return null;
    const wholeNum = parseInt(whole, 10);
    const sign = wholeNum < 0 ? -1 : 1;
    return wholeNum + sign * (parseInt(num, 10) / denominator);
  }

  return null;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Converte um valor decimal em polegadas para uma string fracionária,
 * arredondando para o denominador mais próximo (padrão 1/16").
 */
export function formatInches(
  value: number,
  denominator: number = DEFAULT_DENOMINATOR,
): string {
  if (!Number.isFinite(value)) return "—";

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  const whole = Math.floor(abs);
  let numerator = Math.round((abs - whole) * denominator);
  let den = denominator;

  if (numerator === den) {
    return `${sign}${whole + 1}"`;
  }
  if (numerator === 0) {
    return `${sign}${whole}"`;
  }

  const divisor = gcd(numerator, den);
  numerator /= divisor;
  den /= divisor;

  if (whole === 0) {
    return `${sign}${numerator}/${den}"`;
  }
  return `${sign}${whole} ${numerator}/${den}"`;
}

export function formatDecimal(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}"`;
}

export const FRACTION_DENOMINATORS = [2, 4, 8, 16, 32, 64] as const;
