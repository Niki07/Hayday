import { describeRate, type RuleCheck } from "../context";
import { daysEn, daysEs, hoursEn, hoursEs, money } from "../format";

// Farmworkers: 1.5x after 8 hours in a day, 2x after 12 (AB 1066, fully phased in for all employers 2025).
// Straight-time pay for these hours is counted elsewhere (piece pay, hourly pay, or "unpaid-hours"),
// so this finding is only the overtime extra: 0.5x for hours 8 to 12, 1x for hours over 12.
export const dailyOt: RuleCheck = (_stub, _answers, ctx) => {
  const { dailyHalfHours: half, dailyDoubleHours: dbl, dailyOtDays, dailyRequired, dailyOwed, paidAppliedDaily } = ctx.ot;
  if (half + dbl === 0 || dailyOwed < 0.01) return null;

  const r = money(ctx.premiumRate);
  const rate = describeRate(ctx);
  const mathEn = [
    half > 0 ? `${hoursEn(half)} × ${r} × 0.5` : "",
    dbl > 0 ? `${hoursEn(dbl)} × ${r} × 1` : "",
  ].filter(Boolean).join(" + ");
  const mathEs = [
    half > 0 ? `${hoursEs(half)} × ${r} × 0.5` : "",
    dbl > 0 ? `${hoursEs(dbl)} × ${r} × 1` : "",
  ].filter(Boolean).join(" + ");
  const doubleEn = dbl > 0 ? ` and ${hoursEn(dbl)} past 12 hours (owed 2 times your rate)` : "";
  const doubleEs = dbl > 0 ? ` y ${hoursEs(dbl)} después de 12 horas (se pagan al doble)` : "";
  const paidEn = paidAppliedDaily > 0
    ? ` Your stub already shows ${money(paidAppliedDaily)} of overtime extra: ${money(dailyRequired)} − ${money(paidAppliedDaily)} = ${money(dailyOwed)}.`
    : " Your stub shows no overtime pay for these hours.";
  const paidEs = paidAppliedDaily > 0
    ? ` Su talón ya muestra ${money(paidAppliedDaily)} de pago extra por tiempo extra: ${money(dailyRequired)} − ${money(paidAppliedDaily)} = ${money(dailyOwed)}.`
    : " Su talón no muestra pago de tiempo extra por estas horas.";

  return {
    id: "daily-ot",
    amount: dailyOwed,
    severity: "high",
    citation: "Cal. Labor Code § 857 et seq. (AB 1066); Wage Order 14",
    title: { en: "Overtime after 8 hours a day not paid", es: "No le pagaron tiempo extra después de 8 horas al día" },
    explanation: {
      en: `Farmworkers must get 1.5 times their regular rate for hours over 8 in a day. On ${daysEn(dailyOtDays)} you worked more than 8 hours: ${hoursEn(half)} of overtime${doubleEn}. ${rate.en} Your straight pay for these hours is counted already, so the missing part is the extra: ${mathEn} = ${money(dailyRequired)}.${paidEn}`,
      es: `Los trabajadores del campo deben recibir 1.5 veces su tarifa regular por las horas después de 8 en un día. En ${daysEs(dailyOtDays)} trabajó más de 8 horas: ${hoursEs(half)} de tiempo extra${doubleEs}. ${rate.es} Su pago normal por esas horas ya está contado, así que lo que falta es el extra: ${mathEs} = ${money(dailyRequired)}.${paidEs}`,
    },
  };
};
