# Handoff 05 — Result page, claim page, PDF download

- Model: Sonnet
- Depends on: 01, 02, 03. Needs `CheckProvider` from 04 (`src/lib/check-state.tsx`); if 04 is not done, build against the shape in PLAN.md and read from `sessionStorage` key `hayday-check` so the two meet in the middle. Coordinate the key name in ENGINEERING.md.
- Can run in parallel with: 04, 06
- Estimated time: 75 min

## Goal
The result page shows the headline amount and one card per finding with rule, plain explanation, citation and dollars. The claim page shows the bilingual letter and downloads as PDF. This is the demo's payoff (steps 5–6 of the demo script).

## Read first
- CLAUDE.md, ENGINEERING.md (D-006, D-007 and entries from 01–03), SETUP.md
- PLAN.md: Pages, Data shapes, Demo script
- `src/lib/types.ts`, `src/lib/rules/index.ts`, `src/app/api/claim-letter/route.ts`, `src/lib/i18n.ts`, `src/components/ui/`

## Deliverable
1. `src/app/check/result/page.tsx`:
   - If no result in state, link back to `/check`.
   - Headline: **"You may be owed $184.50"** in the accent color, large. If `totalOwed === 0` and no high/medium findings: green state "This pay stub looks correct" plus the list of what was checked (`checkedRules`).
   - One `Card` per finding, sorted by amount desc: title, amount on the right, plain explanation, citation in small text, severity dot. Info-severity findings (e.g. stub incomplete with $0) go in a smaller "Also noticed" group.
   - Disclaimer block: "This is an estimate based on what you entered. A free legal aid office can confirm it." with a button to `/help`.
   - Primary button **Prepare my claim** → `/check/claim`. Secondary **Check another pay stub** → `reset()` then `/check`.
2. `src/app/check/claim/page.tsx`:
   - Optional name field ("Your name, optional") stored only in state.
   - On load, POST to `/api/claim-letter`; show a progress state "Writing your letter..."; render English and Spanish side by side on desktop, tabbed on mobile.
   - **Download PDF** button: use `window.print()` with a print stylesheet (`@media print`) that hides the shell and shows the two letters one after the other on separate pages, plus the findings table. No PDF library.
   - **Copy text** button for each language.
   - "Next steps" checklist: keep your pay stubs; write down your hours every day; contact a legal aid office (link `/help`); file a wage claim with the Labor Commissioner (link).
3. All strings in both languages, added to `i18n.ts`. Currency formatting via `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })` in both languages.

## Done when
- [ ] With sample 1 flowing through 04 (or seeded into sessionStorage), result shows the expected total and three cards
- [ ] The zero-findings sample shows the green state
- [ ] Claim page renders both letters in DEMO_MODE and print preview shows a clean two-page document with no header/footer/buttons
- [ ] No horizontal scroll at 375px; `npm run lint` passes; decisions logged; Report back filled in

## Constraints
- Do not edit package.json or install packages (D-009). Needed dependency → Open item in your report.
- No new dependencies. No PDF library.
- Do not modify rules or llm wrapper.

## Out of scope
- Upload/review UI (04)
- Organizer view (09)

## Decisions already made
- D-007: amounts come from the rules result only; the letter must use those numbers

## Decisions you may hit (escalate to Fable 5.1)
- Whether to email the letter (no; copy and print only)

## Notes from wave 1 (read these)
- Demo total is $184.47, sample `grape-trays` (findings `daily-ot`, `piece-rest`, `unpaid-hours`). Sample `correct-stub` is the zero-findings case.
- `/api/claim-letter` never fails for AI reasons (falls back to a template letter); only 400 on a bad body, 500 on missing config. Takes about 8–10 s live: show "Writing your letter...".
- `src/lib/fixtures/letters.ts` exports `formatUsd`; reuse it for currency.
- The session state key agreed for 04 is `hayday-check` in `sessionStorage` (D-008). 04 is being built in parallel; if `src/lib/check-state.tsx` exists, use it, else read that key directly.
- The dev server on port 3000 belongs to the planning session; if you need your own, use `PORT=3001 npm run dev`.

## Report back (filled in by the subrunner)
- Status:
- What was built:
- What was NOT done and why:
- Decisions logged: D-___
- Open questions for Fable:
- How to verify:
