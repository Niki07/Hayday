// Organizer view (handoff 09): check a pay stub with no worker answers, only what the stub itself shows.
// Organizers do not know each worker's daily hours or breaks, so the rules that need them return nothing.
// Two stub-only estimates are added on top (D-052), using the existing checks unchanged with assumed days:
//  - piece-rest: hours spread evenly over an assumed 5-day week.
//  - weekly-ot: assumed 8-hour days, so only hours over 40 a week count and no daily overtime is invented.
// Both under-count on purpose. The worker path (checkPayStub with real answers) is not touched.

import type { CheckResult, Finding, PayStub, WorkerAnswers } from "../types";
import { buildContext } from "./context";
import { checkPayStub, RULES } from "./index";
import { money, num, round2, sum } from "./format";
import { pieceRest, restPeriodsForDay } from "./checks/piece-rest";
import { weeklyOt } from "./checks/weekly-ot";

/** Assumed workdays per week for the stub-only rest-break estimate. */
export const ASSUMED_WORKDAYS_PER_WEEK = 5;

export function organizerAnswers(stub: PayStub, county: string): WorkerAnswers {
  return {
    county,
    dailyHours: [],
    gotRestBreaks: "yes",
    gotMealBreaks: "yes",
    paidByPiece: stub.payType === "piece" || stub.payType === "mixed",
  };
}

export type OrganizerResult = CheckResult & {
  /** Ids of findings whose amount rests on an assumed schedule (shown as "est."). */
  estimated: string[];
};

function calendarDays(stub: PayStub): number | undefined {
  if (!stub.periodStart || !stub.periodEnd) return undefined;
  const a = Date.parse(stub.periodStart);
  const b = Date.parse(stub.periodEnd);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return undefined;
  return Math.round((b - a) / 86_400_000) + 1;
}

/** Workweeks in the pay period: round(days ÷ 7), at least 1; 1 when the dates are missing. */
export function periodWeeks(stub: PayStub): number {
  const days = calendarDays(stub);
  return days ? Math.max(1, Math.round(days / 7)) : 1;
}

function stubHours(stub: PayStub): number | undefined {
  const h = stub.hoursWorked;
  return typeof h === "number" && Number.isFinite(h) && h > 0 ? h : undefined;
}

function estimatePieceRest(stub: PayStub, county: string): Finding | null {
  const hours = stubHours(stub);
  if (hours === undefined) return null;
  const answers = organizerAnswers(stub, county);
  if (!answers.paidByPiece) return null;

  const weeks = periodWeeks(stub);
  const workdays = Math.min(ASSUMED_WORKDAYS_PER_WEEK * weeks, calendarDays(stub) ?? Infinity);
  const perDay = hours / workdays;
  const assumed = { ...answers, dailyHours: Array<number>(workdays).fill(perDay) };
  const ctx = buildContext(stub, assumed);
  const finding = pieceRest(stub, assumed, ctx);
  if (!finding) return null;

  const periods = sum(ctx.days.map(restPeriodsForDay));
  const required = round2(((periods * 10) / 60) * ctx.premiumRate);
  const paid = round2(stub.restBreakPay ?? 0);
  const r = money(ctx.premiumRate);
  const paidEn = paid > 0 ? `The stub shows ${money(paid)} of rest-break pay.` : "The stub shows no separate rest-break pay.";
  const paidEs = paid > 0 ? `El talón muestra ${money(paid)} de pago por descansos.` : "El talón no muestra pago aparte por descansos.";
  return {
    ...finding,
    explanation: {
      en: `Estimate from the stub alone: ${num(hours)} hours over an assumed ${workdays}-day schedule = ${periods} ten-minute rest breaks at ${r} an hour = ${money(required)}. ${paidEn}`,
      es: `Cálculo solo con el talón: ${num(hours)} horas en ${workdays} días supuestos = ${periods} descansos de diez minutos a ${r} por hora = ${money(required)}. ${paidEs}`,
    },
  };
}

function estimateWeeklyOt(stub: PayStub, county: string): Finding | null {
  const hours = stubHours(stub);
  if (hours === undefined) return null;
  const weeks = periodWeeks(stub);
  if (hours <= 40 * weeks) return null;

  // Same hours every week, each week as 8-hour days plus one shorter day, so splitIntoWeeks lines them up.
  const perWeek = hours / weeks;
  const week: number[] = Array<number>(Math.floor(perWeek / 8)).fill(8);
  if (perWeek % 8 > 0) week.push(perWeek % 8);
  const answers = { ...organizerAnswers(stub, county), dailyHours: Array<number[]>(weeks).fill(week).flat() };
  const ctx = buildContext(stub, answers);
  const finding = weeklyOt(stub, answers, ctx);
  if (!finding) return null;

  const over = sum(ctx.ot.weeklyHours);
  const r = money(ctx.premiumRate);
  const paid = ctx.ot.paidAppliedWeekly;
  const paidEn = paid > 0 ? ` The stub already shows ${money(paid)} of overtime extra.` : " The stub shows no overtime pay.";
  const paidEs = paid > 0 ? ` El talón ya muestra ${money(paid)} de pago extra.` : " El talón no muestra pago de tiempo extra.";
  return {
    ...finding,
    explanation: {
      en: `Estimate from the stub alone: ${num(hours)} hours in ${weeks === 1 ? "1 week" : `${weeks} weeks`} is ${num(over)} hours over 40 a week. ${num(over)} × ${r} × 0.5 = ${money(ctx.ot.weeklyRequired)}.${paidEn}`,
      es: `Cálculo solo con el talón: ${num(hours)} horas en ${weeks === 1 ? "1 semana" : `${weeks} semanas`} son ${num(over)} horas después de 40 a la semana. ${num(over)} × ${r} × 0.5 = ${money(ctx.ot.weeklyRequired)}.${paidEs}`,
    },
  };
}

/** checkPayStub with organizerAnswers, plus the two stub-only estimates. Organizer page only. */
export function checkStubOnly(stub: PayStub, county: string): OrganizerResult {
  const base = checkPayStub(stub, organizerAnswers(stub, county));
  const findings = [...base.findings];
  const estimated: string[] = [];
  const has = (id: string) => findings.some((f) => f.id === id);

  for (const estimate of [estimatePieceRest, estimateWeeklyOt]) {
    const f = estimate(stub, county);
    if (f && !has(f.id)) {
      findings.push(f);
      estimated.push(f.id);
    }
  }

  const order = RULES.map((r) => r.id);
  findings.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return {
    findings,
    totalOwed: round2(sum(findings.map((f) => f.amount))),
    checkedRules: base.checkedRules,
    estimated,
  };
}
