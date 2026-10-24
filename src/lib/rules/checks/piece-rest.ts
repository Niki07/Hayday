import { describeRate, type RuleCheck } from "../context";
import { daysEn, daysEs, money, num, round2, sum } from "../format";

/** Ten-minute rest periods owed in a day: one per 4 hours or major fraction, none under 3.5 hours. */
export function restPeriodsForDay(hours: number): number {
  if (hours < 3.5) return 0;
  return Math.ceil((hours - 2) / 4);
}

// Labor Code § 226.2: piece-rate workers must be paid for rest and recovery periods separately from
// piece pay, at the higher of their average hourly rate or the minimum wage.
// "some" breaks: we assume one day's breaks were missed (that day goes to rest-premium instead).
// "no" breaks: nothing to pay here; rest-premium covers it.
export const pieceRest: RuleCheck = (stub, answers, ctx) => {
  if (!ctx.isPiece || answers.gotRestBreaks === "no") return null;

  let paidDays = ctx.days.filter((d) => restPeriodsForDay(d) > 0);
  if (answers.gotRestBreaks === "some") paidDays = paidDays.slice(1);
  const periods = sum(paidDays.map(restPeriodsForDay));
  if (periods === 0) return null;

  const minutes = periods * 10;
  const required = round2((minutes / 60) * ctx.premiumRate);
  const paid = round2(stub.restBreakPay ?? 0);
  const amount = round2(required - paid);
  if (amount < 0.01) return null;

  const rate = describeRate(ctx);
  const r = money(ctx.premiumRate);
  const someEn = answers.gotRestBreaks === "some"
    ? " You said you got some of your breaks, so we left out one day (it is on the missed rest break card)."
    : "";
  const someEs = answers.gotRestBreaks === "some"
    ? " Usted dijo que tuvo algunos descansos, así que dejamos fuera un día (está en la tarjeta de descansos no dados)."
    : "";
  const paidEn = paid > 0
    ? ` Your stub shows ${money(paid)} for rest breaks: ${money(required)} − ${money(paid)} = ${money(amount)}.`
    : " Your stub shows no separate pay for rest breaks.";
  const paidEs = paid > 0
    ? ` Su talón muestra ${money(paid)} por descansos: ${money(required)} − ${money(paid)} = ${money(amount)}.`
    : " Su talón no muestra pago aparte por los descansos.";

  return {
    id: "piece-rest",
    amount,
    severity: "high",
    citation: "Cal. Labor Code § 226.2",
    title: { en: "Rest breaks not paid on top of piece pay", es: "No le pagaron los descansos aparte del pago a destajo" },
    explanation: {
      en: `When you are paid by the piece, your 10-minute rest breaks must be paid separately, on top of your piece pay. Over ${daysEn(paidDays.length)} you were owed ${num(periods)} rest breaks, which is ${num(minutes)} minutes.${someEn} ${rate.en} ${num(minutes)} minutes ÷ 60 × ${r} = ${money(required)}.${paidEn} This is an estimate: we divide by all hours on your stub, which keeps it on the low side.`,
      es: `Cuando le pagan a destajo, sus descansos de 10 minutos se deben pagar aparte, además del pago a destajo. En ${daysEs(paidDays.length)} le correspondían ${num(periods)} descansos, o sea ${num(minutes)} minutos.${someEs} ${rate.es} ${num(minutes)} minutos ÷ 60 × ${r} = ${money(required)}.${paidEs} Es un cálculo aproximado: dividimos entre todas las horas del talón, lo que lo deja un poco bajo.`,
    },
  };
};
