// Hayday rules engine. Pure TypeScript: no React, no Next, no network, no AI (D-007).
// checkPayStub is the only source of dollar amounts in the app.

import type { CheckResult, Finding, PayStub, WorkerAnswers } from "../types";
import { buildContext, type RuleCheck } from "./context";
import { round2, sum } from "./format";
import { minWage } from "./checks/min-wage";
import { dailyOt } from "./checks/daily-ot";
import { weeklyOt } from "./checks/weekly-ot";
import { pieceRest } from "./checks/piece-rest";
import { mealPremium } from "./checks/meal-premium";
import { restPremium } from "./checks/rest-premium";
import { unpaidHours } from "./checks/unpaid-hours";
import { mathMismatch } from "./checks/math-mismatch";
import { stubIncomplete } from "./checks/stub-incomplete";

export const RULES: { id: string; check: RuleCheck }[] = [
  { id: "min-wage", check: minWage },
  { id: "daily-ot", check: dailyOt },
  { id: "weekly-ot", check: weeklyOt },
  { id: "piece-rest", check: pieceRest },
  { id: "meal-premium", check: mealPremium },
  { id: "rest-premium", check: restPremium },
  { id: "unpaid-hours", check: unpaidHours },
  { id: "math-mismatch", check: mathMismatch },
  { id: "stub-incomplete", check: stubIncomplete },
];

export function checkPayStub(stub: PayStub, answers: WorkerAnswers): CheckResult {
  const ctx = buildContext(stub, answers);
  const findings: Finding[] = [];
  for (const rule of RULES) {
    const finding = rule.check(stub, answers, ctx);
    if (finding) findings.push(finding);
  }
  return {
    findings,
    totalOwed: round2(sum(findings.map((f) => f.amount))),
    checkedRules: RULES.map((r) => r.id),
  };
}

export { getMinimumWage } from "./rates";
