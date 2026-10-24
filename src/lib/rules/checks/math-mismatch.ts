import type { RuleCheck } from "../context";
import { money, num, round2, sum } from "../format";

/** Differences up to this many dollars are treated as rounding on the stub, not an error. */
export const MATH_TOLERANCE = 1.0;

// The stub's own numbers should add up: line items = gross, gross − deductions = net.
// If the stub pays less than its own lines add up to, that shortfall is counted as owed.
// Mixed hourly + piece stubs skip the gross check: we cannot tell which hours were hourly.
export const mathMismatch: RuleCheck = (stub, _answers, ctx) => {
  const linesEn: string[] = [];
  const linesEs: string[] = [];
  const values: number[] = [];
  const otHours = stub.overtimeHours ?? 0;

  if (!ctx.isPiece && stub.hourlyRate && stub.hoursWorked) {
    const regular = stub.hoursWorked - otHours;
    const v = round2(regular * stub.hourlyRate);
    values.push(v);
    linesEn.push(`${num(regular)} hours × ${money(stub.hourlyRate)} = ${money(v)}`);
    linesEs.push(`${num(regular)} horas × ${money(stub.hourlyRate)} = ${money(v)}`);
  }
  if (ctx.isPiece && stub.pieceUnits && stub.pieceRate) {
    const v = round2(stub.pieceUnits * stub.pieceRate);
    const unit = stub.pieceUnitName ?? "pieces";
    values.push(v);
    linesEn.push(`${num(stub.pieceUnits)} ${unit} × ${money(stub.pieceRate)} = ${money(v)}`);
    linesEs.push(`${num(stub.pieceUnits)} ${unit} × ${money(stub.pieceRate)} = ${money(v)}`);
  }
  if (otHours > 0 && stub.overtimeRate) {
    const v = round2(otHours * stub.overtimeRate);
    values.push(v);
    linesEn.push(`${num(otHours)} overtime hours × ${money(stub.overtimeRate)} = ${money(v)}`);
    linesEs.push(`${num(otHours)} horas extra × ${money(stub.overtimeRate)} = ${money(v)}`);
  }
  if (stub.restBreakPay) {
    values.push(round2(stub.restBreakPay));
    linesEn.push(`rest break pay ${money(stub.restBreakPay)}`);
    linesEs.push(`pago de descansos ${money(stub.restBreakPay)}`);
  }

  const problemsEn: string[] = [];
  const problemsEs: string[] = [];
  let amount = 0;

  if (stub.payType !== "mixed" && values.length > 0 && stub.grossPay !== undefined) {
    const expected = round2(sum(values));
    const diff = round2(expected - stub.grossPay);
    if (Math.abs(diff) > MATH_TOLERANCE) {
      if (diff > 0) amount += diff;
      problemsEn.push(
        `Your stub's own lines add up to ${money(expected)} (${linesEn.join("; ")}), but the gross pay says ${money(stub.grossPay)}.` +
          (diff > 0 ? ` ${money(expected)} − ${money(stub.grossPay)} = ${money(diff)} short.` : ""),
      );
      problemsEs.push(
        `Las líneas de su talón suman ${money(expected)} (${linesEs.join("; ")}), pero el pago bruto dice ${money(stub.grossPay)}.` +
          (diff > 0 ? ` ${money(expected)} − ${money(stub.grossPay)} = ${money(diff)} de menos.` : ""),
      );
    }
  }

  if (stub.grossPay !== undefined && stub.netPay !== undefined && stub.deductions) {
    const deducted = round2(sum(stub.deductions.map((d) => d.amount)));
    const expectedNet = round2(stub.grossPay - deducted);
    const diff = round2(expectedNet - stub.netPay);
    if (Math.abs(diff) > MATH_TOLERANCE) {
      if (diff > 0) amount += diff;
      problemsEn.push(
        `Gross pay ${money(stub.grossPay)} − deductions ${money(deducted)} = ${money(expectedNet)}, but the net pay says ${money(stub.netPay)}.` +
          (diff > 0 ? ` That is ${money(diff)} short.` : ""),
      );
      problemsEs.push(
        `Pago bruto ${money(stub.grossPay)} − deducciones ${money(deducted)} = ${money(expectedNet)}, pero el pago neto dice ${money(stub.netPay)}.` +
          (diff > 0 ? ` Son ${money(diff)} de menos.` : ""),
      );
    }
  }

  if (problemsEn.length === 0) return null;
  amount = round2(amount);

  return {
    id: "math-mismatch",
    amount,
    severity: amount > 0 ? "medium" : "info",
    citation: "Cal. Labor Code § 226(a)",
    title: { en: "The numbers on your stub do not add up", es: "Los números de su talón no cuadran" },
    explanation: {
      en: `${problemsEn.join(" ")} A pay stub must be accurate. Ask your employer to explain the difference.`,
      es: `${problemsEs.join(" ")} El talón de pago debe ser correcto. Pídale a su empleador que le explique la diferencia.`,
    },
  };
};
