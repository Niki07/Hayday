import { describeRate, type RuleCheck } from "../context";
import { hoursEn, hoursEs, money, num, sum } from "../format";

// Farmworkers: 1.5x after 40 hours in a workweek. Only the first 8 hours of each day count toward the
// 40, so hours already paid as daily overtime are not counted twice. Like daily-ot, this is the extra half.
export const weeklyOt: RuleCheck = (_stub, _answers, ctx) => {
  const { weeklyHours, weeklyRequired, weeklyOwed, paidAppliedWeekly } = ctx.ot;
  const hours = sum(weeklyHours);
  if (hours === 0 || weeklyOwed < 0.01) return null;

  const r = money(ctx.premiumRate);
  const rate = describeRate(ctx);
  const multiWeek = weeklyHours.length > 1;
  const weeksEn = multiWeek ? ` (by week: ${weeklyHours.map(num).join(", ")})` : "";
  const weeksEs = multiWeek ? ` (por semana: ${weeklyHours.map(num).join(", ")})` : "";
  const paidEn = paidAppliedWeekly > 0
    ? ` Your stub already shows ${money(paidAppliedWeekly)} of overtime extra toward these hours: ${money(weeklyRequired)} − ${money(paidAppliedWeekly)} = ${money(weeklyOwed)}.`
    : " Your stub shows no overtime pay for these hours.";
  const paidEs = paidAppliedWeekly > 0
    ? ` Su talón ya muestra ${money(paidAppliedWeekly)} de pago extra por estas horas: ${money(weeklyRequired)} − ${money(paidAppliedWeekly)} = ${money(weeklyOwed)}.`
    : " Su talón no muestra pago de tiempo extra por estas horas.";

  return {
    id: "weekly-ot",
    amount: weeklyOwed,
    severity: "high",
    citation: "Cal. Labor Code § 857 et seq. (AB 1066); Wage Order 14",
    title: { en: "Overtime after 40 hours a week not paid", es: "No le pagaron tiempo extra después de 40 horas a la semana" },
    explanation: {
      en: `Farmworkers must get 1.5 times their regular rate for hours over 40 in a week (not counting hours already paid as daily overtime). You had ${hoursEn(hours)} over 40${weeksEn}. ${rate.en} Your straight pay for these hours is counted already, so the missing part is the extra: ${hoursEn(hours)} × ${r} × 0.5 = ${money(weeklyRequired)}.${paidEn}`,
      es: `Los trabajadores del campo deben recibir 1.5 veces su tarifa regular por las horas después de 40 en una semana (sin contar las horas ya pagadas como tiempo extra diario). Usted tuvo ${hoursEs(hours)} después de 40${weeksEs}. ${rate.es} Su pago normal por esas horas ya está contado, así que lo que falta es el extra: ${hoursEs(hours)} × ${r} × 0.5 = ${money(weeklyRequired)}.${paidEs}`,
    },
  };
};
