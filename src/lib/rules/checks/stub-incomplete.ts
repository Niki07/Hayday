import type { RuleCheck } from "../context";

type Item = { en: string; es: string };

// Labor Code § 226(a): the stub must list these items. We check the ones in PLAN.md's table:
// employer, pay period dates, total hours, rates, piece units and piece rate, gross, deductions, net.
// No dollar amount: the § 226(e) penalty is real, but it depends on the facts, so we only mention it.
export const stubIncomplete: RuleCheck = (stub, _answers, ctx) => {
  const missing: Item[] = [];
  const has = (v: unknown) => v !== undefined && v !== null && v !== "";

  if (!has(stub.employerName?.trim())) missing.push({ en: "employer name", es: "nombre del empleador" });
  if (!has(stub.periodStart) || !has(stub.periodEnd))
    missing.push({ en: "pay period dates", es: "fechas del periodo de pago" });
  if (!has(stub.hoursWorked)) missing.push({ en: "total hours worked", es: "total de horas trabajadas" });
  if ((!ctx.isPiece || stub.payType === "mixed") && !has(stub.hourlyRate))
    missing.push({ en: "hourly rate", es: "pago por hora" });
  if (ctx.isPiece && !has(stub.pieceUnits))
    missing.push({ en: "number of pieces (units)", es: "número de piezas (unidades)" });
  if (ctx.isPiece && !has(stub.pieceRate)) missing.push({ en: "piece rate", es: "pago por pieza" });
  if (has(stub.overtimeHours) && (stub.overtimeHours ?? 0) > 0 && !has(stub.overtimeRate))
    missing.push({ en: "overtime rate", es: "pago por hora de tiempo extra" });
  if (!has(stub.grossPay)) missing.push({ en: "gross pay", es: "pago bruto" });
  if (!stub.deductions) missing.push({ en: "deductions", es: "deducciones" });
  if (!has(stub.netPay)) missing.push({ en: "net pay", es: "pago neto" });

  if (missing.length === 0) return null;

  return {
    id: "stub-incomplete",
    amount: 0,
    severity: "medium",
    citation: "Cal. Labor Code § 226(a)",
    title: { en: "Pay stub is missing required information", es: "Al talón de pago le falta información obligatoria" },
    explanation: {
      en: `California law says every pay stub must show certain items so you can check your pay. Yours is missing: ${missing.map((m) => m.en).join(", ")}. This card adds $0 to the total, but a missing or wrong stub can mean the employer owes a penalty. A legal aid office can tell you more.`,
      es: `La ley de California dice que cada talón de pago debe mostrar ciertos datos para que usted pueda revisar su pago. Al suyo le falta: ${missing.map((m) => m.es).join(", ")}. Esta tarjeta suma $0 al total, pero un talón incompleto o incorrecto puede significar que el empleador debe una multa. Una oficina de ayuda legal le puede explicar más.`,
    },
  };
};
