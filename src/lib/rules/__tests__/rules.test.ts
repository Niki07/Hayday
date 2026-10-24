import { describe, expect, it } from "vitest";
import type { PayStub, WorkerAnswers } from "../../types";
import { checkPayStub } from "../index";
import { getMinimumWage } from "../rates";
import { splitIntoWeeks } from "../context";
import { restPeriodsForDay } from "../checks/piece-rest";
import { getSample, samples } from "../../fixtures/samples";

// A clean hourly stub: 5 days × 8 hours at $18.00, nothing wrong. Each test changes one thing.
function hourlyStub(over: Partial<PayStub> = {}): PayStub {
  return {
    employerName: "Test Farms",
    employeeName: "Test Worker",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-07",
    payType: "hourly",
    hoursWorked: 40,
    hourlyRate: 18,
    grossPay: 720,
    netPay: 650,
    deductions: [{ label: "Tax", amount: 70 }],
    ...over,
  };
}

// A clean piece stub: 400 boxes × $2.00 = $800 for 40 hours ($20/hour), rest breaks paid separately.
function pieceStub(over: Partial<PayStub> = {}): PayStub {
  return {
    employerName: "Test Farms",
    employeeName: "Test Worker",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-07",
    payType: "piece",
    hoursWorked: 40,
    pieceUnits: 400,
    pieceRate: 2,
    pieceUnitName: "box",
    restBreakPay: 33.33, // 10 breaks × 10 min = 100 min ÷ 60 × $20.00 = $33.33
    grossPay: 833.33,
    netPay: 763.33,
    deductions: [{ label: "Tax", amount: 70 }],
    ...over,
  };
}

function answers(over: Partial<WorkerAnswers> = {}): WorkerAnswers {
  return {
    county: "Fresno",
    dailyHours: [8, 8, 8, 8, 8],
    gotRestBreaks: "yes",
    gotMealBreaks: "yes",
    paidByPiece: false,
    ...over,
  };
}

const pieceAnswers = (over: Partial<WorkerAnswers> = {}) => answers({ paidByPiece: true, ...over });

function find(stub: PayStub, a: WorkerAnswers, id: string) {
  return checkPayStub(stub, a).findings.find((f) => f.id === id);
}

describe("rates", () => {
  it("returns the verified state minimum wage by date", () => {
    expect(getMinimumWage("2024-06-01", "Fresno")).toBe(16.0);
    expect(getMinimumWage("2025-06-01", "Fresno")).toBe(16.5);
    expect(getMinimumWage("2025-12-31", "Kern")).toBe(16.5);
    expect(getMinimumWage("2026-01-01", "Kern")).toBe(16.9);
    expect(getMinimumWage("2026-10-24", "Tulare County")).toBe(16.9);
  });
  it("uses the newest rate when the stub has no date", () => {
    expect(getMinimumWage("", "Fresno")).toBe(16.9);
  });
});

describe("helpers", () => {
  it("counts rest periods per day (one per 4 hours or major fraction)", () => {
    expect(restPeriodsForDay(3)).toBe(0);
    expect(restPeriodsForDay(3.5)).toBe(1);
    expect(restPeriodsForDay(6)).toBe(1);
    expect(restPeriodsForDay(6.5)).toBe(2);
    expect(restPeriodsForDay(10)).toBe(2);
    expect(restPeriodsForDay(10.5)).toBe(3);
  });
  it("splits a two-week period into two workweeks", () => {
    const weeks = splitIntoWeeks([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], "2026-06-01", "2026-06-14");
    expect(weeks.map((w) => w.length)).toEqual([6, 6]);
  });
});

describe("clean stubs produce no findings", () => {
  it("hourly", () => {
    const r = checkPayStub(hourlyStub(), answers());
    expect(r.findings).toEqual([]);
    expect(r.totalOwed).toBe(0);
    expect(r.checkedRules).toHaveLength(9);
  });
  it("piece", () => {
    const r = checkPayStub(pieceStub(), pieceAnswers());
    expect(r.findings).toEqual([]);
    expect(r.totalOwed).toBe(0);
  });
});

describe("min-wage", () => {
  it("flags an hourly rate below the minimum", () => {
    const f = find(hourlyStub({ hourlyRate: 16, grossPay: 640, netPay: 570 }), answers(), "min-wage");
    expect(f?.amount).toBe(36); // 40 × ($16.90 − $16.00)
    expect(f?.explanation.en).toContain("40 hours × $0.90 = $36.00");
    expect(f?.explanation.es).toContain("40 horas × $0.90 = $36.00");
    expect(f?.citation).toContain("1182.12");
  });
  it("flags piece pay that averages below the minimum", () => {
    const stub = pieceStub({ pieceUnits: 300, grossPay: 633.33, netPay: 563.33 }); // $600 ÷ 40 = $15.00
    const f = find(stub, pieceAnswers(), "min-wage");
    expect(f?.amount).toBe(76); // 40 × $16.90 = $676 − $600
  });
  it("does not flag a rate at the minimum", () => {
    expect(find(hourlyStub({ hourlyRate: 16.9, grossPay: 676, netPay: 606 }), answers(), "min-wage")).toBeUndefined();
  });
  it("uses the rate for the pay period date", () => {
    // $16.50 was the minimum in 2025, so not a violation then.
    const stub = hourlyStub({ hourlyRate: 16.5, grossPay: 660, netPay: 590, periodStart: "2025-06-02", periodEnd: "2025-06-08" });
    expect(find(stub, answers(), "min-wage")).toBeUndefined();
  });
});

describe("daily-ot", () => {
  it("owes the half-time extra after 8 hours and double after 12", () => {
    const stub = hourlyStub({ hoursWorked: 44, grossPay: 792, netPay: 722 });
    const f = find(stub, answers({ dailyHours: [13, 8, 8, 8, 7] }), "daily-ot");
    // 4 h × $18 × 0.5 = $36 + 1 h × $18 × 1 = $18 → $54
    expect(f?.amount).toBe(54);
    expect(f?.explanation.en).toContain("4 hours × $18.00 × 0.5 + 1 hour × $18.00 × 1 = $54.00");
  });
  it("subtracts overtime already paid on the stub", () => {
    const stub = hourlyStub({ hoursWorked: 42, overtimeHours: 2, overtimeRate: 27, grossPay: 774, netPay: 704 });
    expect(find(stub, answers({ dailyHours: [10, 8, 8, 8, 8] }), "daily-ot")).toBeUndefined();
  });
  it("is not flagged with no day over 8 hours", () => {
    expect(find(hourlyStub(), answers(), "daily-ot")).toBeUndefined();
  });
  it("uses the piece average rate for piece workers", () => {
    const stub = pieceStub({ hoursWorked: 50 }); // $800 ÷ 50 = $16.00 → below min, so $16.90 is used
    const f = find(stub, pieceAnswers({ dailyHours: [10, 10, 10, 10, 10] }), "daily-ot");
    expect(f?.amount).toBe(84.5); // 10 h × $16.90 × 0.5
  });
});

describe("weekly-ot", () => {
  it("owes the half-time extra after 40 hours in a week", () => {
    const stub = hourlyStub({ hoursWorked: 48, grossPay: 864, netPay: 794 });
    const f = find(stub, answers({ dailyHours: [8, 8, 8, 8, 8, 8] }), "weekly-ot");
    expect(f?.amount).toBe(72); // 8 h × $18 × 0.5
  });
  it("does not double count daily overtime hours", () => {
    const stub = hourlyStub({ hoursWorked: 45, grossPay: 810, netPay: 740 });
    const r = checkPayStub(stub, answers({ dailyHours: [9, 9, 9, 9, 9] }));
    expect(r.findings.find((f) => f.id === "daily-ot")?.amount).toBe(45); // 5 h × $9
    expect(r.findings.find((f) => f.id === "weekly-ot")).toBeUndefined(); // 5 × 8 = 40, not over
  });
  it("is not flagged at 40 hours", () => {
    expect(find(hourlyStub(), answers(), "weekly-ot")).toBeUndefined();
  });
});

describe("piece-rest", () => {
  it("owes rest break pay when the piece stub has none", () => {
    const stub = pieceStub({ restBreakPay: undefined, grossPay: 800, netPay: 730 });
    const f = find(stub, pieceAnswers(), "piece-rest");
    expect(f?.amount).toBe(33.33); // 100 min ÷ 60 × $20.00
    expect(f?.citation).toBe("Cal. Labor Code § 226.2");
    expect(f?.explanation.en).toContain("100 minutes ÷ 60 × $20.00 = $33.33");
  });
  it("owes the difference when rest pay is too low", () => {
    const stub = pieceStub({ restBreakPay: 20, grossPay: 820, netPay: 750 });
    expect(find(stub, pieceAnswers(), "piece-rest")?.amount).toBe(13.33);
  });
  it("is not flagged for hourly workers", () => {
    expect(find(hourlyStub(), answers(), "piece-rest")).toBeUndefined();
  });
  it("is not flagged when no breaks were taken (rest-premium covers it)", () => {
    const stub = pieceStub({ restBreakPay: undefined, grossPay: 800, netPay: 730 });
    expect(find(stub, pieceAnswers({ gotRestBreaks: "no" }), "piece-rest")).toBeUndefined();
  });
});

describe("meal-premium", () => {
  it("owes one hour per day with no meal break", () => {
    const f = find(hourlyStub(), answers({ gotMealBreaks: "no" }), "meal-premium");
    expect(f?.amount).toBe(90); // 5 days × $18
  });
  it("counts one day for 'some'", () => {
    expect(find(hourlyStub(), answers({ gotMealBreaks: "some" }), "meal-premium")?.amount).toBe(18);
  });
  it("ignores days of 5 hours or less", () => {
    const stub = hourlyStub({ hoursWorked: 25, grossPay: 450, netPay: 380 });
    expect(find(stub, answers({ dailyHours: [5, 5, 5, 5, 5], gotMealBreaks: "no" }), "meal-premium")).toBeUndefined();
  });
  it("is not flagged when meal breaks were taken", () => {
    expect(find(hourlyStub(), answers(), "meal-premium")).toBeUndefined();
  });
});

describe("rest-premium", () => {
  it("owes one hour per day with no rest breaks", () => {
    expect(find(hourlyStub(), answers({ gotRestBreaks: "no" }), "rest-premium")?.amount).toBe(90);
  });
  it("counts one day for 'some'", () => {
    expect(find(hourlyStub(), answers({ gotRestBreaks: "some" }), "rest-premium")?.amount).toBe(18);
  });
  it("is not flagged when rest breaks were taken", () => {
    expect(find(hourlyStub(), answers(), "rest-premium")).toBeUndefined();
  });
});

describe("unpaid-hours", () => {
  it("owes hours the worker reports beyond the stub at the hourly rate", () => {
    const f = find(hourlyStub(), answers({ dailyHours: [8, 8, 8, 8, 10] }), "unpaid-hours");
    expect(f?.amount).toBe(36); // 2 h × $18
  });
  it("pays piece workers' missing hours at the minimum wage", () => {
    const f = find(pieceStub(), pieceAnswers({ dailyHours: [8, 8, 8, 8, 9] }), "unpaid-hours");
    expect(f?.amount).toBe(16.9);
  });
  it("ignores differences under 15 minutes", () => {
    expect(find(hourlyStub(), answers({ dailyHours: [8, 8, 8, 8, 8.2] }), "unpaid-hours")).toBeUndefined();
  });
  it("is not flagged when the stub has no hours to compare", () => {
    expect(find(hourlyStub({ hoursWorked: undefined }), answers({ dailyHours: [10, 10] }), "unpaid-hours")).toBeUndefined();
  });
});

describe("math-mismatch", () => {
  it("flags gross pay lower than hours × rate", () => {
    const f = find(hourlyStub({ grossPay: 700, netPay: 630 }), answers(), "math-mismatch");
    expect(f?.amount).toBe(20);
  });
  it("flags net pay that does not equal gross minus deductions", () => {
    const f = find(hourlyStub({ netPay: 640 }), answers(), "math-mismatch");
    expect(f?.amount).toBe(10);
  });
  it("reports overpayment on the stub with $0 owed", () => {
    const f = find(hourlyStub({ grossPay: 740, netPay: 670 }), answers(), "math-mismatch");
    expect(f?.amount).toBe(0);
    expect(f?.severity).toBe("info");
  });
  it("tolerates rounding up to $1", () => {
    expect(find(hourlyStub({ grossPay: 719.5, netPay: 649.5 }), answers(), "math-mismatch")).toBeUndefined();
  });
});

describe("stub-incomplete", () => {
  it("lists missing required items", () => {
    const stub = hourlyStub({ employerName: undefined, periodEnd: undefined, deductions: undefined });
    const f = find(stub, answers(), "stub-incomplete");
    expect(f?.amount).toBe(0);
    expect(f?.explanation.en).toContain("employer name, pay period dates, deductions");
    expect(f?.explanation.es).toContain("nombre del empleador, fechas del periodo de pago, deducciones");
  });
  it("requires piece units and rate for piece workers", () => {
    const stub = pieceStub({ pieceUnits: undefined, pieceRate: undefined });
    const f = find(stub, pieceAnswers(), "stub-incomplete");
    expect(f?.explanation.en).toContain("number of pieces (units), piece rate");
  });
  it("is not flagged for a complete stub", () => {
    expect(find(hourlyStub(), answers(), "stub-incomplete")).toBeUndefined();
  });
});

describe("every finding is bilingual, cited and rounded to cents", () => {
  it("holds across all samples", () => {
    for (const s of samples) {
      for (const f of checkPayStub(s.stub, s.answers).findings) {
        expect(f.title.en && f.title.es && f.explanation.en && f.explanation.es && f.citation).toBeTruthy();
        expect(Math.round(f.amount * 100) / 100).toBe(f.amount);
        expect(f.amount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("sample fixtures", () => {
  it("has five samples, one correct and covering every rule", () => {
    expect(samples).toHaveLength(5);
    expect(samples.some((s) => s.expectedFindings.length === 0)).toBe(true);
    const covered = new Set(samples.flatMap((s) => s.expectedFindings));
    expect([...covered].sort()).toEqual(checkPayStub(samples[0].stub, samples[0].answers).checkedRules.slice().sort());
  });

  it("looks samples up by id or by 1-based number", () => {
    expect(getSample("1")?.id).toBe("grape-trays");
    expect(getSample("citrus-bins")?.id).toBe("citrus-bins");
    expect(getSample("9")).toBeUndefined();
  });

  it("sample 1 is the demo case near $184.50", () => {
    const r = checkPayStub(samples[0].stub, samples[0].answers);
    expect(r.findings.map((f) => f.id).sort()).toEqual(["daily-ot", "piece-rest", "unpaid-hours"]);
    expect(Math.abs(r.totalOwed - 184.5)).toBeLessThan(1);
  });

  for (const s of samples) {
    it(`${s.id} reproduces its expected findings and total`, () => {
      const r = checkPayStub(s.stub, s.answers);
      expect(r.findings.map((f) => f.id).sort()).toEqual([...s.expectedFindings].sort());
      expect(r.totalOwed).toBeCloseTo(s.expectedTotal, 2);
    });
  }
});
