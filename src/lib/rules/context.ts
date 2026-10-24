// Shared facts every rule check needs, computed once per pay stub.
// Field meanings (agreed with handoff 03's extractor prompt):
// - hoursWorked is the TOTAL hours on the stub, including any overtime hours.
// - overtimeHours / overtimeRate are the hours paid at an overtime rate and that rate.
// - For piece-rate stubs, piece pay already covers straight time for every hour, so an overtime line
//   on a piece stub is counted entirely as overtime premium.

import type { Finding, PayStub, WorkerAnswers } from "../types";
import { DAILY_DOUBLE_AFTER, DAILY_OT_AFTER, WEEKLY_OT_AFTER, getMinimumWage } from "./rates";
import { money, num, round2, sum } from "./format";

export type RuleContext = {
  /** ISO date used to look up the minimum wage (period start, else period end), if the stub has one. */
  date?: string;
  minWage: number;
  /** Paid by the piece (worker says so, or the stub is piece or mixed). */
  isPiece: boolean;
  /** Total hours on the stub (hoursWorked), if printed. */
  stubHours?: number;
  /** Hours the worker reports, summed over dailyHours. Undefined when no days were entered. */
  workerHours?: number;
  /** Worker's hours per day worked, cleaned (positive numbers, at most 24). */
  days: number[];
  /** days split into workweeks. */
  weeks: number[][];
  /** Pay for straight time: hourly regular pay, or piece pay. Excludes overtime and rest-break pay. */
  straightEarnings?: number;
  /** Regular rate per hour, rounded to cents: the hourly rate, or straightEarnings ÷ rateHours. */
  regularRate?: number;
  regularRateKind: "hourly" | "average" | "none";
  /** Hours the regular rate is spread over (stub hours, else worker hours). */
  rateHours?: number;
  /** Rate used for premiums and break pay: the regular rate, never below the minimum wage. */
  premiumRate: number;
  /** Overtime premium (pay above straight time) the stub already shows. */
  paidOtPremium: number;
  ot: {
    /** Hours over 8 (up to 12) in a day, owed an extra 0.5x. */
    dailyHalfHours: number;
    /** Hours over 12 in a day, owed an extra 1x. */
    dailyDoubleHours: number;
    /** Days with any daily overtime. */
    dailyOtDays: number;
    /** Hours over 40 in a week, counting only the first 8 hours of each day. One entry per week. */
    weeklyHours: number[];
    dailyRequired: number;
    weeklyRequired: number;
    /** Still owed after subtracting paidOtPremium (applied to daily first, then weekly). */
    dailyOwed: number;
    weeklyOwed: number;
    /** Part of paidOtPremium used against daily and weekly overtime. */
    paidAppliedDaily: number;
    paidAppliedWeekly: number;
  };
};

function isPositive(n: number | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function daysBetween(start: string, end: string): number | undefined {
  const a = Date.parse(start);
  const b = Date.parse(end);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return undefined;
  return Math.round((b - a) / 86_400_000) + 1;
}

/** Split worked days into workweeks. Uses the pay period length when known, else 7 entries per week. */
export function splitIntoWeeks(days: number[], periodStart?: string, periodEnd?: string): number[][] {
  if (days.length === 0) return [];
  const calendarDays = periodStart && periodEnd ? daysBetween(periodStart, periodEnd) : undefined;
  const weekCount = calendarDays
    ? Math.max(1, Math.round(calendarDays / 7))
    : Math.ceil(days.length / 7);
  const weeks: number[][] = [];
  const base = Math.floor(days.length / weekCount);
  let extra = days.length % weekCount;
  let i = 0;
  for (let w = 0; w < weekCount; w++) {
    const size = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    weeks.push(days.slice(i, i + size));
    i += size;
  }
  return weeks.filter((w) => w.length > 0);
}

export function buildContext(stub: PayStub, answers: WorkerAnswers): RuleContext {
  const date = stub.periodStart || stub.periodEnd || undefined;
  const minWage = getMinimumWage(date ?? "", answers.county);
  const isPiece = answers.paidByPiece || stub.payType === "piece" || stub.payType === "mixed";

  const days = (answers.dailyHours ?? [])
    .filter((d) => isPositive(d))
    .map((d) => Math.min(d, 24));
  const workerHours = days.length > 0 ? sum(days) : undefined;
  const weeks = splitIntoWeeks(days, stub.periodStart, stub.periodEnd);
  const stubHours = isPositive(stub.hoursWorked) ? stub.hoursWorked : undefined;

  const otHoursOnStub = isPositive(stub.overtimeHours) ? stub.overtimeHours : 0;
  const otPayOnStub = otHoursOnStub * (isPositive(stub.overtimeRate) ? stub.overtimeRate : 0);
  const restPayOnStub = isPositive(stub.restBreakPay) ? stub.restBreakPay : 0;

  // Regular rate.
  let straightEarnings: number | undefined;
  let regularRate: number | undefined;
  let regularRateKind: RuleContext["regularRateKind"] = "none";
  let rateHours: number | undefined;

  if (!isPiece && isPositive(stub.hourlyRate)) {
    regularRateKind = "hourly";
    regularRate = round2(stub.hourlyRate);
    rateHours = stubHours ?? workerHours;
    if (stubHours !== undefined) straightEarnings = (stubHours - otHoursOnStub) * stub.hourlyRate;
  } else {
    // Piece rate (or unknown pay type with no hourly rate): average hourly rate under Labor Code § 226.2,
    // total pay excluding overtime premium and rest-break pay, divided by hours worked.
    if (isPositive(stub.pieceUnits) && isPositive(stub.pieceRate)) {
      straightEarnings = stub.pieceUnits * stub.pieceRate;
    } else if (isPositive(stub.grossPay)) {
      straightEarnings = Math.max(0, stub.grossPay - otPayOnStub - restPayOnStub);
    }
    rateHours = stubHours ?? workerHours;
    if (straightEarnings !== undefined && rateHours !== undefined) {
      regularRateKind = "average";
      regularRate = round2(straightEarnings / rateHours);
    }
  }

  const premiumRate = Math.max(regularRate ?? 0, minWage);

  // Overtime premium already on the stub.
  let paidOtPremium = 0;
  if (otHoursOnStub > 0 && isPositive(stub.overtimeRate)) {
    paidOtPremium =
      regularRateKind === "hourly"
        ? otHoursOnStub * Math.max(0, stub.overtimeRate - (stub.hourlyRate ?? 0))
        : otPayOnStub;
  }

  // Overtime hours from the worker's own daily hours.
  let dailyHalfHours = 0;
  let dailyDoubleHours = 0;
  let dailyOtDays = 0;
  for (const d of days) {
    const half = Math.min(Math.max(d - DAILY_OT_AFTER, 0), DAILY_DOUBLE_AFTER - DAILY_OT_AFTER);
    const dbl = Math.max(d - DAILY_DOUBLE_AFTER, 0);
    dailyHalfHours += half;
    dailyDoubleHours += dbl;
    if (half + dbl > 0) dailyOtDays++;
  }
  const weeklyHours = weeks.map((w) =>
    Math.max(0, sum(w.map((d) => Math.min(d, DAILY_OT_AFTER))) - WEEKLY_OT_AFTER),
  );

  const dailyRequired = round2(dailyHalfHours * premiumRate * 0.5 + dailyDoubleHours * premiumRate);
  const weeklyRequired = round2(sum(weeklyHours) * premiumRate * 0.5);
  const paidAppliedDaily = Math.min(paidOtPremium, dailyRequired);
  const paidAppliedWeekly = Math.min(paidOtPremium - paidAppliedDaily, weeklyRequired);

  return {
    date,
    minWage,
    isPiece,
    stubHours,
    workerHours,
    days,
    weeks,
    straightEarnings,
    regularRate,
    regularRateKind,
    rateHours,
    premiumRate,
    paidOtPremium: round2(paidOtPremium),
    ot: {
      dailyHalfHours,
      dailyDoubleHours,
      dailyOtDays,
      weeklyHours,
      dailyRequired,
      weeklyRequired,
      dailyOwed: round2(dailyRequired - paidAppliedDaily),
      weeklyOwed: round2(weeklyRequired - paidAppliedWeekly),
      paidAppliedDaily: round2(paidAppliedDaily),
      paidAppliedWeekly: round2(paidAppliedWeekly),
    },
  };
}

/** One sentence (en, es) saying how the regular rate was found, for explanations. */
export function describeRate(ctx: RuleContext): { en: string; es: string } {
  const rate = money(ctx.premiumRate);
  if (ctx.regularRate === undefined) {
    return {
      en: `We could not work out your regular rate from the stub, so we used the minimum wage, ${rate} an hour.`,
      es: `No pudimos calcular su tarifa regular con el talón, así que usamos el salario mínimo, ${rate} por hora.`,
    };
  }
  const belowMin = ctx.regularRate < ctx.minWage;
  if (ctx.regularRateKind === "hourly") {
    return belowMin
      ? {
          en: `Your stub rate is below the minimum wage, so we used the minimum wage, ${rate} an hour.`,
          es: `La tarifa de su talón es menor que el salario mínimo, así que usamos el salario mínimo, ${rate} por hora.`,
        }
      : {
          en: `Your regular rate is your hourly rate, ${rate}.`,
          es: `Su tarifa regular es su pago por hora, ${rate}.`,
        };
  }
  const earned = money(ctx.straightEarnings ?? 0);
  const h = num(ctx.rateHours ?? 0);
  const base = {
    en: `Your average hourly rate is your piece pay divided by your hours: ${earned} ÷ ${h} hours = ${money(ctx.regularRate)} an hour.`,
    es: `Su tarifa promedio por hora es su pago a destajo dividido entre sus horas: ${earned} ÷ ${h} horas = ${money(ctx.regularRate)} por hora.`,
  };
  if (belowMin) {
    base.en += ` That is below the minimum wage, so we used ${rate}.`;
    base.es += ` Eso es menos que el salario mínimo, así que usamos ${rate}.`;
  }
  return base;
}

export type RuleCheck = (stub: PayStub, answers: WorkerAnswers, ctx: RuleContext) => Finding | null;

/** Hours the worker reports beyond the stub, if at least 15 minutes. */
export function missingHours(ctx: RuleContext): number {
  if (ctx.workerHours === undefined || ctx.stubHours === undefined) return 0;
  const missing = round2(ctx.workerHours - ctx.stubHours);
  return missing >= 0.25 ? missing : 0;
}
