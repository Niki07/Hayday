import type { RuleCheck } from "../context";
import { hoursEn, hoursEs, money, round2 } from "../format";

// Pay per hour below the minimum wage. Hourly: the stub's rate. Piece: piece pay ÷ hours on the stub.
// Hours missing from the stub are not counted here; they are paid in full under "unpaid-hours".
export const minWage: RuleCheck = (_stub, _answers, ctx) => {
  if (ctx.regularRate === undefined || ctx.rateHours === undefined) return null;
  if (ctx.regularRate >= ctx.minWage) return null;

  const h = ctx.rateHours;
  const min = money(ctx.minWage);

  if (ctx.regularRateKind === "hourly") {
    const gap = round2(ctx.minWage - ctx.regularRate);
    const amount = round2(gap * h);
    if (amount < 0.01) return null;
    return {
      id: "min-wage",
      amount,
      severity: "high",
      citation: "Cal. Labor Code §§ 1182.12, 1194",
      title: { en: "Paid less than the minimum wage", es: "Pago menor que el salario mínimo" },
      explanation: {
        en: `Your stub pays ${money(ctx.regularRate)} an hour. The California minimum wage for this pay period is ${min} an hour, so you are short ${money(gap)} for every hour. ${hoursEn(h)} × ${money(gap)} = ${money(amount)}.`,
        es: `Su talón paga ${money(ctx.regularRate)} por hora. El salario mínimo de California para este periodo es ${min} por hora, así que le faltan ${money(gap)} por cada hora. ${hoursEs(h)} × ${money(gap)} = ${money(amount)}.`,
      },
    };
  }

  const earned = ctx.straightEarnings ?? 0;
  const floor = round2(ctx.minWage * h);
  const amount = round2(floor - earned);
  if (amount < 0.01) return null;
  return {
    id: "min-wage",
    amount,
    severity: "high",
    citation: "Cal. Labor Code §§ 1182.12, 1194",
    title: { en: "Piece pay came out below the minimum wage", es: "El pago a destajo quedó por debajo del salario mínimo" },
    explanation: {
      en: `Even when you are paid by the piece, you must earn at least the minimum wage for every hour. Your piece pay was ${money(earned)} for ${hoursEn(h)}, which is ${money(ctx.regularRate)} an hour. The minimum for this pay period is ${min} an hour: ${hoursEn(h)} × ${min} = ${money(floor)}. ${money(floor)} − ${money(earned)} = ${money(amount)}.`,
      es: `Aunque le paguen a destajo, debe ganar por lo menos el salario mínimo por cada hora. Su pago a destajo fue ${money(earned)} por ${hoursEs(h)}, o sea ${money(ctx.regularRate)} por hora. El mínimo para este periodo es ${min} por hora: ${hoursEs(h)} × ${min} = ${money(floor)}. ${money(floor)} − ${money(earned)} = ${money(amount)}.`,
    },
  };
};
