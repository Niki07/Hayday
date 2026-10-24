# Handoff 02 — Rules engine, rates table, tests, sample fixtures

- Model: Opus
- Depends on: scaffold (already done)
- Can run in parallel with: 01, 03
- Estimated time: 90 min

## Goal
A pure TypeScript module that takes a pay stub's fields plus the worker's answers and returns a list of findings with dollar amounts, plain-language explanations in English and Spanish, and legal citations. Fully unit tested. Plus five sample pay stubs with their expected findings, used by the demo and by everyone else's tests.

## Context
This is the heart of the product and the thing judges will ask "how do you know?" about. See D-007: the AI never does the math. Every number on the result page comes from here.

## Read first
- CLAUDE.md, ENGINEERING.md (D-004, D-007), SETUP.md
- PLAN.md: "Data shapes" (use these types exactly) and "Rules in scope" (implement exactly these)

## Deliverable
1. `src/lib/types.ts`: the `PayStub`, `WorkerAnswers`, `Finding`, `CheckResult` types from PLAN.md, exported. (Handoff 03 imports these; keep the names.)
2. `src/lib/rules/rates.ts`: California minimum wage by effective date (at least 2024, 2025, 2026 values) and a table of local minimum wage ordinances for any Central Valley city that has one (most do not; an empty or near-empty table with a comment is a valid answer). Each value has a comment with the source URL. **Verify every number against dir.ca.gov or the city's official site with a web search. Do not use a number from memory.** Export `getMinimumWage(date: string, county: string, city?: string): number`.
3. `src/lib/rules/index.ts`: `checkPayStub(stub: PayStub, answers: WorkerAnswers): CheckResult`. One file per rule under `src/lib/rules/checks/`, each exporting `(stub, answers, ctx) => Finding | null`. Rules: `min-wage`, `daily-ot`, `weekly-ot`, `piece-rest`, `meal-premium`, `rest-premium`, `stub-incomplete`, `math-mismatch`, `unpaid-hours`. Amount math must be shown in the explanation (e.g. "2 hours × $8.45 half-time premium = $16.90").
4. Explanations in both languages, written for a reader with no legal background. Citations as short strings ("Cal. Labor Code § 226.2").
5. `src/lib/fixtures/samples.ts`: five sample stubs, each with `id`, a short `label` (en/es), the `PayStub` fields, default `WorkerAnswers`, and `expectedFindings` ids and `expectedTotal`. Make them realistic for Central Valley farm work (grape harvest piece rate per tray, almond sweeping hourly, citrus by the bin, a correct stub, a stub with unpaid hours). Use fictional employer names. Sample 1 should be the piece-rate case used in the demo script with a total near $184.50 and findings `piece-rest`, `daily-ot`, `unpaid-hours`.
6. `src/lib/rules/__tests__/rules.test.ts` with vitest: every rule has a positive and a negative case; every sample fixture produces exactly its expected findings and total. The `test` script already exists.

## Done when
- [ ] `npm test` passes with all rules and all five fixtures covered
- [ ] `checkPayStub(samples[0].stub, samples[0].answers).totalOwed` is within $1 of the fixture's expected total
- [ ] Every rate value has a source URL comment and was verified online this session
- [ ] No imports from React, Next or the LLM wrapper; module is pure
- [ ] Decisions logged in ENGINEERING.md (rounding policy, how piece-rate average hourly rate is computed, anything simplified)
- [ ] Report back section below is filled in

## Constraints
- Do not edit package.json or install packages (D-009). Needed dependency → Open item in your report.
- Pure TypeScript, no runtime dependencies beyond what is installed.
- Keep rule logic simple and defensible. When the law has edge cases you cannot cover in the time, implement the common case and note the simplification in the finding's explanation and in ENGINEERING.md.
- Do not touch `src/app/` or `src/lib/llm.ts`.

## Out of scope
- Reading images, calling any API
- UI
- Rules not in the PLAN.md table (log as Open if one seems important)

## Decisions already made (do not reopen)
- D-007: deterministic rules, AI never computes money
- Types in PLAN.md are the contract with handoffs 03, 04, 05

## Decisions you may hit (escalate to Fable 5.1)
- If a verified rate contradicts PLAN.md assumptions, use the verified value and log it
- If the 8-hour daily overtime threshold does not apply to some employer size in 2026 per the verified source, implement what the source says and log it

## Report back (filled in by the subrunner)
- Status: Done. `npm test` passes 48/48 with vitest (after the planning session installed `vite`). `tsc --noEmit` is clean for these files.
- What was built:
  - `src/lib/types.ts`: the PLAN.md types, exactly.
  - `src/lib/rules/rates.ts`: CA minimum wage 2023–2026 ($15.50 / $16.00 / $16.50 / $16.90), verified on dir.ca.gov this session with source URLs. Local ordinance table is empty (no Central Valley locality in the UC Berkeley inventory DIR links to). Overtime thresholds 8 / 12 / 40 verified on dir.ca.gov. `getMinimumWage(date, county, city?)`.
  - `src/lib/rules/index.ts`: `checkPayStub(stub, answers): CheckResult`, plus `RULES`. Shared math in `context.ts`, formatting in `format.ts`, one file per rule in `checks/` (all nine). Every finding has en/es explanations that show the arithmetic, and a short citation. Pure: no React, Next or LLM imports.
  - `src/lib/fixtures/samples.ts`: `samples` (5) and `getSample(id)`, which takes the slug or a 1-based number so `/check?sample=1` works. Totals: grape-trays $184.47 (demo: daily-ot, piece-rest, unpaid-hours), almond-sweeping $103.70, citrus-bins $152.90, correct-stub $0, unpaid-hours $80.00. All nine rules are covered.
  - `src/lib/rules/__tests__/rules.test.ts`: a positive and a negative case per rule, rate and helper tests, and every sample's findings and total.
- What was NOT done and why: Simplifications are listed in D-026 to D-029: employer size, the 6-hour meal waiver, the seventh-day rule, the § 226(e) penalty amount, and leaving rest time out of the piece-rate average. All of them err toward the lower amount.
- Decisions logged: D-024, D-025, D-026, D-027, D-028, D-029, D-030
- Open questions for Fable:
  1. (Resolved) `vite` was missing for `npm test`; it is installed now.
  2. The demo total is $184.47, not $184.50. Update PLAN.md, the demo script and the slides to match.
  3. Handoff 03's `src/lib/fixtures/demo-stub.ts` should now return `samples[0].stub` (its own numbers differ).
  4. D-027: `hoursWorked` means total hours including overtime, which matches 03's prompt. Handoff 04's review form should label it "Total hours".
- How to verify: `npm test`. Quick check of the totals: `npx tsx -e 'import {checkPayStub} from "./src/lib/rules"; import {samples} from "./src/lib/fixtures/samples"; for (const s of samples) console.log(s.id, checkPayStub(s.stub, s.answers).totalOwed)'`
