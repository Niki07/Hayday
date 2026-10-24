import { missingHours, type RuleCheck } from "../context";
import { hoursEn, hoursEs, money, round2 } from "../format";

// Labor Code § 1194: every hour worked must be paid. Hours the worker reports beyond the stub are owed
// at the hourly rate (never below minimum wage). For piece workers this is time with no piece pay
// (waiting, moving between fields), which § 226.2 says must be paid at least the minimum wage.
export const unpaidHours: RuleCheck = (stub, _answers, ctx) => {
  const missing = missingHours(ctx);
  if (missing === 0) return null;

  const rate = ctx.isPiece ? ctx.minWage : Math.max(stub.hourlyRate ?? 0, ctx.minWage);
  const amount = round2(missing * rate);
  const r = money(rate);
  const whyEn = ctx.isPiece
    ? `Because you are paid by the piece, time that is not on the stub (waiting, moving between fields, meetings) must still be paid, at least at the minimum wage, ${r} an hour.`
    : `They must be paid at your hourly rate, ${r}.`;
  const whyEs = ctx.isPiece
    ? `Como le pagan a destajo, el tiempo que no aparece en el talón (esperas, cambios de campo, juntas) se debe pagar, por lo menos al salario mínimo, ${r} por hora.`
    : `Se deben pagar a su tarifa por hora, ${r}.`;

  return {
    id: "unpaid-hours",
    amount,
    severity: "high",
    citation: ctx.isPiece ? "Cal. Labor Code §§ 1194, 226.2" : "Cal. Labor Code § 1194",
    title: { en: "Hours worked but not on your stub", es: "Horas trabajadas que no aparecen en su talón" },
    explanation: {
      en: `You told us you worked ${hoursEn(ctx.workerHours ?? 0)}. Your stub shows ${hoursEn(ctx.stubHours ?? 0)}. That leaves ${hoursEn(missing)} missing. ${whyEn} ${hoursEn(missing)} × ${r} = ${money(amount)}.`,
      es: `Usted nos dijo que trabajó ${hoursEs(ctx.workerHours ?? 0)}. Su talón muestra ${hoursEs(ctx.stubHours ?? 0)}. Faltan ${hoursEs(missing)}. ${whyEs} ${hoursEs(missing)} × ${r} = ${money(amount)}.`,
    },
  };
};
