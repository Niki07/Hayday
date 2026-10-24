import { describeRate, type RuleCheck } from "../context";
import { daysEn, daysEs, money, round2 } from "../format";
import { restPeriodsForDay } from "./piece-rest";

// Labor Code § 226.7, Wage Order 14: a paid 10-minute rest break for every 4 hours (or major fraction).
// Missed rest breaks owe one extra hour of pay at the regular rate, at most once per day.
// "no" counts every day of 3.5 hours or more. "some" counts one day, the minimum we can be sure of.
export const restPremium: RuleCheck = (_stub, answers, ctx) => {
  if (answers.gotRestBreaks === "yes") return null;
  const qualifying = ctx.days.filter((d) => restPeriodsForDay(d) > 0).length;
  if (qualifying === 0) return null;

  const count = answers.gotRestBreaks === "no" ? qualifying : 1;
  const amount = round2(count * ctx.premiumRate);
  const r = money(ctx.premiumRate);
  const rate = describeRate(ctx);
  const saidEn = answers.gotRestBreaks === "no"
    ? `You said you did not get rest breaks. You worked long enough to need one on ${daysEn(count)}.`
    : "You said you got only some of your rest breaks, so we counted 1 day. If you missed more days, you are owed more.";
  const saidEs = answers.gotRestBreaks === "no"
    ? `Usted dijo que no tuvo descansos. Trabajó lo suficiente para necesitar uno en ${daysEs(count)}.`
    : "Usted dijo que tuvo solo algunos descansos, así que contamos 1 día. Si le faltaron más días, le deben más.";

  return {
    id: "rest-premium",
    amount,
    severity: "medium",
    citation: "Cal. Labor Code § 226.7; Wage Order 14",
    title: { en: "Missed rest breaks", es: "Descansos no dados" },
    explanation: {
      en: `You must get a paid 10-minute rest break for every 4 hours you work. For each day rest breaks are missed, the employer owes one extra hour of pay. ${saidEn} ${rate.en} ${daysEn(count)} × ${r} = ${money(amount)}.`,
      es: `Debe tener un descanso pagado de 10 minutos por cada 4 horas de trabajo. Por cada día sin descansos, el empleador le debe una hora extra de pago. ${saidEs} ${rate.es} ${daysEs(count)} × ${r} = ${money(amount)}.`,
    },
  };
};
