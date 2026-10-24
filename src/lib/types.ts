// Shared data shapes for Hayday. Contract between handoffs 02, 03, 04 and 05.
// Copied exactly from PLAN.md "Data shapes". Do not rename fields.

export type PayStub = {
  employerName?: string;
  employeeName?: string;
  periodStart?: string; // ISO dates
  periodEnd?: string;
  payType: "hourly" | "piece" | "mixed" | "unknown";
  hoursWorked?: number;
  hourlyRate?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  pieceUnits?: number;
  pieceRate?: number;
  pieceUnitName?: string;
  restBreakPay?: number; // separately listed, if any
  grossPay?: number;
  netPay?: number;
  deductions?: { label: string; amount: number }[];
  rawText?: string;
  confidence?: number; // 0..1 from the extractor
};

export type WorkerAnswers = {
  county: string;
  dailyHours: number[]; // one entry per day worked in the period
  gotRestBreaks: "yes" | "some" | "no";
  gotMealBreaks: "yes" | "some" | "no";
  paidByPiece: boolean;
};

export type Finding = {
  id: string; // e.g. "min-wage", "daily-ot", "piece-rest", "meal-premium", "stub-incomplete", "math-mismatch", "unpaid-hours"
  amount: number; // dollars owed, 0 allowed for non-monetary violations
  title: { en: string; es: string };
  explanation: { en: string; es: string };
  citation: string; // e.g. "Cal. Labor Code § 226.2"
  severity: "high" | "medium" | "info";
};

export type CheckResult = {
  findings: Finding[];
  totalOwed: number;
  checkedRules: string[];
};
