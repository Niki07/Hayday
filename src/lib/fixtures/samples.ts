// Five fictional Central Valley pay stubs with the worker's answers and the findings the rules engine
// must produce for them. Used by the demo ("Try a sample"), the /samples/[id] renderer and the tests.
// Employers and workers are made up. Deduction lines are realistic-looking filler; no rule depends on them
// except that gross − deductions = net.

import type { PayStub, WorkerAnswers } from "../types";

export type Sample = {
  id: string;
  label: { en: string; es: string };
  stub: PayStub;
  answers: WorkerAnswers;
  expectedFindings: string[];
  expectedTotal: number;
};

export const samples: Sample[] = [
  // 1. Demo case. Raisin grape harvest, paid per tray. 5 days of 10 hours, stub shows 48 hours.
  //    piece-rest: 10 breaks = 100 min ÷ 60 × $22.60 = $37.67
  //    daily-ot:   10 h × $22.60 × 0.5 = $113.00
  //    unpaid:     2 h × $16.90 = $33.80                         total $184.47
  {
    id: "grape-trays",
    label: { en: "Grape harvest, paid per tray", es: "Cosecha de uva, pago por charola" },
    stub: {
      employerName: "Sunfield Vineyards LLC",
      employeeName: "Maria Hernandez",
      periodStart: "2026-09-14",
      periodEnd: "2026-09-20",
      payType: "piece",
      hoursWorked: 48,
      pieceUnits: 1142,
      pieceRate: 0.95,
      pieceUnitName: "tray",
      grossPay: 1084.9,
      netPay: 917.01,
      deductions: [
        { label: "Federal income tax", amount: 61.0 },
        { label: "Social Security", amount: 67.26 },
        { label: "Medicare", amount: 15.73 },
        { label: "CA state income tax", amount: 9.8 },
        { label: "CA SDI", amount: 14.1 },
      ],
      rawText:
        "SUNFIELD VINEYARDS LLC\nFresno, CA\nEarnings Statement\nEmployee: Maria Hernandez\nPay period: 09/14/2026 - 09/20/2026\nHours worked: 48.00\nPiece work: 1142 trays @ $0.95 = $1,084.90\nGross pay: $1,084.90\nFederal income tax: $61.00\nSocial Security: $67.26\nMedicare: $15.73\nCA state income tax: $9.80\nCA SDI: $14.10\nNet pay: $917.01",
      confidence: 0.93,
    },
    answers: {
      county: "Fresno",
      dailyHours: [10, 10, 10, 10, 10],
      gotRestBreaks: "yes",
      gotMealBreaks: "yes",
      paidByPiece: true,
    },
    expectedFindings: ["daily-ot", "piece-rest", "unpaid-hours"],
    expectedTotal: 184.47,
  },

  // 2. Almond harvest sweeping, hourly at last year's minimum wage. 6 days of 8 hours, no overtime paid.
  //    min-wage:     48 h × ($16.90 − $16.50) = $19.20
  //    weekly-ot:    8 h × $16.90 × 0.5 = $67.60
  //    meal-premium: "some" → 1 day × $16.90 = $16.90           total $103.70
  {
    id: "almond-sweeping",
    label: { en: "Almond sweeping, paid by the hour", es: "Barrido de almendra, pago por hora" },
    stub: {
      employerName: "Westside Orchard Services",
      employeeName: "Jose Ramirez",
      periodStart: "2026-08-03",
      periodEnd: "2026-08-09",
      payType: "hourly",
      hoursWorked: 48,
      hourlyRate: 16.5,
      grossPay: 792.0,
      netPay: 678.92,
      deductions: [
        { label: "Federal income tax", amount: 38.0 },
        { label: "Social Security", amount: 49.1 },
        { label: "Medicare", amount: 11.48 },
        { label: "CA state income tax", amount: 4.2 },
        { label: "CA SDI", amount: 10.3 },
      ],
      rawText:
        "WESTSIDE ORCHARD SERVICES\nModesto, CA\nPay Stub\nEmployee: Jose Ramirez\nPeriod: 08/03/2026 - 08/09/2026\nRegular hours: 48.00 @ $16.50 = $792.00\nGross: $792.00\nFederal income tax: $38.00\nSocial Security: $49.10\nMedicare: $11.48\nCA state income tax: $4.20\nCA SDI: $10.30\nNet: $678.92",
      confidence: 0.95,
    },
    answers: {
      county: "Stanislaus",
      dailyHours: [8, 8, 8, 8, 8, 8],
      gotRestBreaks: "yes",
      gotMealBreaks: "some",
      paidByPiece: false,
    },
    expectedFindings: ["meal-premium", "min-wage", "weekly-ot"],
    expectedTotal: 103.7,
  },

  // 3. Navel orange harvest, paid per bin. Slow week; the stub prints no hours at all.
  //    min-wage:        36 h × $16.90 = $608.40 − $540.00 = $68.40
  //    rest-premium:    "no" → 5 days × $16.90 = $84.50
  //    stub-incomplete: total hours missing, $0                   total $152.90
  {
    id: "citrus-bins",
    label: { en: "Orange harvest, paid per bin", es: "Cosecha de naranja, pago por bin" },
    stub: {
      employerName: "Valley Crest Citrus Co.",
      employeeName: "Ana Lopez",
      periodStart: "2026-01-12",
      periodEnd: "2026-01-18",
      payType: "piece",
      pieceUnits: 24,
      pieceRate: 22.5,
      pieceUnitName: "bin",
      grossPay: 540.0,
      netPay: 471.67,
      deductions: [
        { label: "Federal income tax", amount: 20.0 },
        { label: "Social Security", amount: 33.48 },
        { label: "Medicare", amount: 7.83 },
        { label: "CA SDI", amount: 7.02 },
      ],
      rawText:
        "VALLEY CREST CITRUS CO.\nVisalia, CA\nEmployee: Ana Lopez\nWeek: 01/12/2026 - 01/18/2026\nBins picked: 24 @ $22.50 = $540.00\nGross: $540.00\nFederal income tax: $20.00\nSocial Security: $33.48\nMedicare: $7.83\nCA SDI: $7.02\nNet: $471.67",
      confidence: 0.88,
    },
    answers: {
      county: "Tulare",
      dailyHours: [8, 8, 8, 6, 6],
      gotRestBreaks: "no",
      gotMealBreaks: "yes",
      paidByPiece: true,
    },
    expectedFindings: ["min-wage", "rest-premium", "stub-incomplete"],
    expectedTotal: 152.9,
  },

  // 4. Carrot harvest, hourly, with one overtime hour paid correctly. Nothing owed.
  {
    id: "correct-stub",
    label: { en: "Carrot harvest, everything correct", es: "Cosecha de zanahoria, todo correcto" },
    stub: {
      employerName: "Golden Furrow Farms",
      employeeName: "Luis Garcia",
      periodStart: "2026-10-05",
      periodEnd: "2026-10-11",
      payType: "hourly",
      hoursWorked: 41,
      hourlyRate: 18.0,
      overtimeHours: 1,
      overtimeRate: 27.0,
      grossPay: 747.0,
      netPay: 639.05,
      deductions: [
        { label: "Federal income tax", amount: 35.0 },
        { label: "Social Security", amount: 46.31 },
        { label: "Medicare", amount: 10.83 },
        { label: "CA state income tax", amount: 6.1 },
        { label: "CA SDI", amount: 9.71 },
      ],
      rawText:
        "GOLDEN FURROW FARMS\nBakersfield, CA\nEarnings Statement\nEmployee: Luis Garcia\nPay period: 10/05/2026 - 10/11/2026\nRegular: 40.00 hrs @ $18.00 = $720.00\nOvertime: 1.00 hrs @ $27.00 = $27.00\nTotal hours: 41.00\nGross pay: $747.00\nFederal income tax: $35.00\nSocial Security: $46.31\nMedicare: $10.83\nCA state income tax: $6.10\nCA SDI: $9.71\nNet pay: $639.05",
      confidence: 0.96,
    },
    answers: {
      county: "Kern",
      dailyHours: [9, 8, 8, 8, 8],
      gotRestBreaks: "yes",
      gotMealBreaks: "yes",
      paidByPiece: false,
    },
    expectedFindings: [],
    expectedTotal: 0,
  },

  // 5. Tomato harvest, hourly. Worker worked 5 × 8 = 40 hours, stub shows 36, and gross is $10 short of
  //    the stub's own 36 × $17.50 = $630.00.
  //    unpaid-hours:  4 h × $17.50 = $70.00
  //    math-mismatch: $630.00 − $620.00 = $10.00                  total $80.00
  {
    id: "unpaid-hours",
    label: { en: "Tomato harvest, hours missing", es: "Cosecha de tomate, faltan horas" },
    stub: {
      employerName: "Delta Row Crops Inc.",
      employeeName: "Rosa Martinez",
      periodStart: "2026-07-20",
      periodEnd: "2026-07-26",
      payType: "hourly",
      hoursWorked: 36,
      hourlyRate: 17.5,
      grossPay: 620.0,
      netPay: 536.51,
      deductions: [
        { label: "Federal income tax", amount: 28.0 },
        { label: "Social Security", amount: 38.44 },
        { label: "Medicare", amount: 8.99 },
        { label: "CA SDI", amount: 8.06 },
      ],
      rawText:
        "DELTA ROW CROPS INC.\nStockton, CA\nPay Statement\nEmployee: Rosa Martinez\nPeriod: 07/20/2026 - 07/26/2026\nHours: 36.00 @ $17.50\nGross pay: $620.00\nFederal income tax: $28.00\nSocial Security: $38.44\nMedicare: $8.99\nCA SDI: $8.06\nNet pay: $536.51",
      confidence: 0.94,
    },
    answers: {
      county: "San Joaquin",
      dailyHours: [8, 8, 8, 8, 8],
      gotRestBreaks: "yes",
      gotMealBreaks: "yes",
      paidByPiece: false,
    },
    expectedFindings: ["math-mismatch", "unpaid-hours"],
    expectedTotal: 80.0,
  },
];

/** Look up a sample by its id ("grape-trays") or by 1-based number ("1"), as in `/check?sample=1`. */
export function getSample(id: string): Sample | undefined {
  const n = Number(id);
  if (Number.isInteger(n) && n >= 1 && n <= samples.length) return samples[n - 1];
  return samples.find((s) => s.id === id);
}
