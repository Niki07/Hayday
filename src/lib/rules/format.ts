// Small pure helpers shared by the rule checks: rounding and number formatting for explanations.

/** Round to cents, half up. Every rate and every finding amount goes through this (see ENGINEERING.md). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** "$1,234.50" */
export function money(n: number): string {
  const fixed = round2(n).toFixed(2);
  const [whole, cents] = fixed.split(".");
  return `$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${cents}`;
}

/** Hours with at most two decimals, no trailing zeros: 10, 8.5, 1.67 */
export function num(n: number): string {
  return String(round2(n));
}

export function hoursEn(n: number): string {
  return `${num(n)} ${n === 1 ? "hour" : "hours"}`;
}

export function hoursEs(n: number): string {
  return `${num(n)} ${n === 1 ? "hora" : "horas"}`;
}

export function daysEn(n: number): string {
  return `${n} ${n === 1 ? "day" : "days"}`;
}

export function daysEs(n: number): string {
  return `${n} ${n === 1 ? "día" : "días"}`;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
