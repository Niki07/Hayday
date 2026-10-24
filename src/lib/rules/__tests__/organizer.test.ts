import { describe, expect, it } from "vitest";
import { RULES } from "../index";
import { buildContext } from "../context";
import { checkStubOnly, organizerAnswers, periodWeeks } from "../organizer";
import { samples } from "../../fixtures/samples";
import { organizerExpected, organizerSamples } from "../../fixtures/organizer-samples";
import { initials, summarize, toCsv } from "../../organizer";

const NEEDS_DAILY_HOURS = ["daily-ot", "weekly-ot", "piece-rest", "meal-premium", "rest-premium", "unpaid-hours"];

describe("stub-only checking (organizer view)", () => {
  it("every rule returns null or a finding, never throws, on empty dailyHours", () => {
    for (const stub of [...samples.map((s) => s.stub), ...organizerSamples, { payType: "unknown" as const }]) {
      const answers = organizerAnswers(stub, "Fresno");
      const ctx = buildContext(stub, answers);
      for (const rule of RULES) {
        const f = rule.check(stub, answers, ctx);
        if (NEEDS_DAILY_HOURS.includes(rule.id)) expect(f, `${rule.id}`).toBeNull();
      }
    }
  });

  it("estimates match the worker path when the assumed week is the real one", () => {
    // Sample 1: 48 h, 5 × 10 h worked → same 10 rest breaks → $37.67.
    const grape = checkStubOnly(samples[0].stub, "Fresno");
    expect(grape.findings.find((f) => f.id === "piece-rest")?.amount).toBe(37.67);
    expect(grape.estimated).toContain("piece-rest");
    expect(grape.findings.map((f) => f.id)).not.toContain("daily-ot");
    // Sample 2: 48 h hourly, no overtime paid → 8 h × $16.90 × 0.5 = $67.60, same as the worker path.
    const almond = checkStubOnly(samples[1].stub, "Fresno");
    expect(almond.findings.find((f) => f.id === "weekly-ot")?.amount).toBe(67.6);
    expect(almond.findings.find((f) => f.id === "min-wage")?.amount).toBe(19.2);
  });

  it("does not invent weekly overtime the stub already paid", () => {
    const correct = checkStubOnly(samples[3].stub, "Fresno"); // 41 h with 1 overtime hour paid
    expect(correct.findings).toEqual([]);
  });

  it("counts weeks from the pay period", () => {
    expect(periodWeeks({ payType: "hourly", periodStart: "2026-09-01", periodEnd: "2026-09-14" })).toBe(2);
    expect(periodWeeks({ payType: "hourly" })).toBe(1);
    const twoWeeks = checkStubOnly(
      { payType: "hourly", periodStart: "2026-09-01", periodEnd: "2026-09-14", hoursWorked: 90, hourlyRate: 20 },
      "Fresno",
    );
    // 90 − 80 = 10 h over 40 a week × $20 × 0.5 = $100.
    expect(twoWeeks.findings.find((f) => f.id === "weekly-ot")?.amount).toBe(100);
  });
});

describe("organizer sample employer", () => {
  it("matches the expected per-stub findings", () => {
    organizerSamples.forEach((stub, i) => {
      const r = checkStubOnly(stub, "Fresno");
      expect(r.findings.map((f) => f.id), stub.employeeName).toEqual(organizerExpected.perStub[i].findings);
      expect(r.totalOwed, stub.employeeName).toBe(organizerExpected.perStub[i].total);
    });
  });

  it("matches the expected pattern", () => {
    const s = summarize(organizerSamples.map((stub) => ({ stub, result: checkStubOnly(stub, "Fresno") })));
    expect(s.stubs).toBe(organizerExpected.stubs);
    expect(s.stubsWithIssues).toBe(organizerExpected.stubsWithIssues);
    expect(s.totalOwed).toBe(organizerExpected.totalOwed);
    expect(s.patterns.map(({ id, count, amount }) => ({ id, count, amount }))).toEqual(organizerExpected.patterns);
    expect(s.patterns[0].title.en).toBe("Rest breaks not paid on top of piece pay");
  });

  it("exports initials only, one row per stub plus totals", () => {
    const rows = organizerSamples.map((stub) => ({ stub, result: checkStubOnly(stub, "Fresno") }));
    const csv = toCsv(rows, "en", {
      headers: ["Worker", "Period", "Type", "Hours", "Gross", "Issues", "Rule", "Owed"],
      total: "Total",
      estimated: "est.",
      payType: (t) => t,
      note: "Note",
    });
    expect(csv).not.toMatch(/Hernandez|Maria/);
    expect(csv).toContain("M.H.");
    const lines = csv.trim().split("\r\n");
    expect(lines).toHaveLength(1 + 6 + 1 + 1);
    expect(lines[7]).toMatch(/^Total,.*,218\.59$/);
  });

  it("makes initials", () => {
    expect(initials("Maria del Carmen Hernandez")).toBe("M.H.");
    expect(initials("josé")).toBe("J.");
    expect(initials("  ")).toBe("—");
    expect(initials(undefined)).toBe("—");
  });
});
