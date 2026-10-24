// Organizer view sample (handoff 09): one fictional employer, six fictional grape pickers, two weekly pay periods.
// Everything is made up. Checked stub-only with checkStubOnly (src/lib/rules/organizer.ts, D-052):
//  - 4 of 6 stubs show no separate rest-break pay (piece-rest, estimated from an assumed 5-day week)
//  - 2 of 6 stubs pay less gross than their own tray lines add up to (math-mismatch)
//  - 1 stub (P.R.) is fully correct
// Per-stub amounts are in organizerExpected; a test checks them.

import type { PayStub } from "../types";
import { round2 } from "../rules/format";

export const ORGANIZER_SAMPLE_EMPLOYER = "Sunfield Vineyards LLC";
export const ORGANIZER_SAMPLE_COUNTY = "Fresno";

const WEEK_1 = { periodStart: "2026-09-14", periodEnd: "2026-09-20" };
const WEEK_2 = { periodStart: "2026-09-21", periodEnd: "2026-09-27" };

/** Realistic-looking payroll deductions; net = gross − deductions exactly, so no rule fires on them. */
function payroll(grossPay: number): Pick<PayStub, "grossPay" | "netPay" | "deductions"> {
  const deductions = [
    { label: "Federal income tax", amount: round2(grossPay * 0.055) },
    { label: "Social Security", amount: round2(grossPay * 0.062) },
    { label: "Medicare", amount: round2(grossPay * 0.0145) },
    { label: "CA state income tax", amount: round2(grossPay * 0.009) },
    { label: "CA SDI", amount: round2(grossPay * 0.013) },
  ];
  const netPay = round2(grossPay - deductions.reduce((a, d) => a + d.amount, 0));
  return { grossPay, netPay, deductions };
}

function trays(
  employeeName: string,
  period: { periodStart: string; periodEnd: string },
  hoursWorked: number,
  pieceUnits: number,
  extra: { restBreakPay?: number; grossPay?: number } = {},
): PayStub {
  const pieceRate = 0.95;
  const lines = round2(pieceUnits * pieceRate + (extra.restBreakPay ?? 0));
  return {
    employerName: ORGANIZER_SAMPLE_EMPLOYER,
    employeeName,
    ...period,
    payType: "piece",
    hoursWorked,
    pieceUnits,
    pieceRate,
    pieceUnitName: "tray",
    ...(extra.restBreakPay !== undefined ? { restBreakPay: extra.restBreakPay } : {}),
    ...payroll(extra.grossPay ?? lines),
    confidence: 1,
  };
}

export const organizerSamples: PayStub[] = [
  // No rest-break pay. 1010 × $0.95 = $959.50 over 40 h → $23.99/h; 10 breaks → $39.98.
  trays("Maria Hernandez", WEEK_1, 40, 1010),
  // No rest-break pay. 870 × $0.95 = $826.50 over 36 h → $22.96/h → $38.27.
  trays("Luis Ortega", WEEK_1, 36, 870),
  // Rest-break pay listed ($37.25), but gross is $20.00 under the lines ($797.25).
  trays("Ana Torres", WEEK_1, 34, 800, { restBreakPay: 37.25, grossPay: 777.25 }),
  // No rest-break pay. 940 × $0.95 = $893.00 over 38 h → $23.50/h → $39.17.
  trays("Rosa Medina", WEEK_2, 38, 940),
  // No rest-break pay, and gross is $40.00 under 1040 × $0.95 = $988.00. $24.70/h → $41.17.
  trays("Javier Soto", WEEK_2, 40, 1040, { grossPay: 948.0 }),
  // Correct: 980 × $0.95 = $931.00 plus $40.00 rest-break pay (more than the $39.78 owed).
  trays("Pedro Ruiz", WEEK_2, 39, 980, { restBreakPay: 40.0 }),
];

/** What checkStubOnly must return for each stub, in order, and the pattern across all six. */
export const organizerExpected = {
  perStub: [
    { findings: ["piece-rest"], total: 39.98 },
    { findings: ["piece-rest"], total: 38.27 },
    { findings: ["math-mismatch"], total: 20.0 },
    { findings: ["piece-rest"], total: 39.17 },
    { findings: ["piece-rest", "math-mismatch"], total: 81.17 },
    { findings: [], total: 0 },
  ],
  stubs: 6,
  stubsWithIssues: 5,
  patterns: [
    { id: "piece-rest", count: 4, amount: 158.59 },
    { id: "math-mismatch", count: 2, amount: 60.0 },
  ],
  totalOwed: 218.59,
};
