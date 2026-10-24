import { describeRate, type RuleCheck } from "../context";
import { daysEn, daysEs, money, round2 } from "../format";

// Labor Code §§ 512, 226.7: a 30-minute meal break is required on days over 5 hours. A missed meal break
// owes one extra hour of pay at the regular rate, at most once per day.
// "no" counts every day over 5 hours. "some" counts one day, the minimum we can be sure of.
export const mealPremium: RuleCheck = (_stub, answers, ctx) => {
  if (answers.gotMealBreaks === "yes") return null;
  const qualifying = ctx.days.filter((d) => d > 5).length;
  if (qualifying === 0) return null;

  const count = answers.gotMealBreaks === "no" ? qualifying : 1;
  const amount = round2(count * ctx.premiumRate);
  const r = money(ctx.premiumRate);
  const rate = describeRate(ctx);
  const saidEn = answers.gotMealBreaks === "no"
    ? `You said you did not get meal breaks. You worked more than 5 hours on ${daysEn(count)}.`
    : "You said you got only some of your meal breaks, so we counted 1 day. If you missed more days, you are owed more.";
  const saidEs = answers.gotMealBreaks === "no"
    ? `Usted dijo que no tuvo descansos para comer. Trabajó más de 5 horas en ${daysEs(count)}.`
    : "Usted dijo que tuvo solo algunos descansos para comer, así que contamos 1 día. Si le faltaron más días, le deben más.";

  return {
    id: "meal-premium",
    amount,
    severity: "medium",
    citation: "Cal. Labor Code §§ 512, 226.7",
    title: { en: "Missed meal breaks", es: "Descansos para comer no dados" },
    explanation: {
      en: `If you work more than 5 hours, you must get a 30-minute meal break before the end of your fifth hour. For each day a meal break is missed, the employer owes one extra hour of pay. ${saidEn} ${rate.en} ${daysEn(count)} × ${r} = ${money(amount)}.`,
      es: `Si trabaja más de 5 horas, debe tener un descanso de 30 minutos para comer antes de terminar su quinta hora. Por cada día sin ese descanso, el empleador le debe una hora extra de pago. ${saidEs} ${rate.es} ${daysEs(count)} × ${r} = ${money(amount)}.`,
    },
  };
};
