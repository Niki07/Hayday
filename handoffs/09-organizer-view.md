# Handoff 09 — Organizer view (stretch, hidden page)

- Model: Opus
- Depends on: everything committed (waves 1–2, trust batch)
- Can run in parallel with: nothing else is running
- Estimated time: 90 min. **Hard stop: report back by 3:15pm local time whatever the state.** If it is not clean by then, the planning session will cut it.

## Goal
A legal aid worker or union organizer loads several pay stubs from one employer and sees the pattern: which rule is broken on how many stubs, and the total estimated owed. One page, at its own address, **not linked from anywhere** until Niki approves it.

## Context
Hayday checks one worker's stub against California farm labor pay rules (`checkPayStub` in `src/lib/rules`, D-007: deterministic). The pitch's organizer tier (PITCH.md) needs a screen. Wage theft is usually systematic: the same missing rest-break pay on every stub. This page shows that. Privacy promise (D-005, D-046): nothing is stored on a server.

## Read first
- CLAUDE.md, ENGINEERING.md (D-005, D-007, D-020, D-023, D-027, D-030, D-045), SETUP.md, AGENTS.md, PLAN.md (Data shapes)
- `src/lib/types.ts`, `src/lib/rules/index.ts` and `checks/*` (what each rule needs from `WorkerAnswers`), `src/lib/rules/sources.ts` (titles per rule id), `src/lib/fixtures/samples.ts`, `src/lib/image.ts` (downscale), `src/app/check/page.tsx` (how upload calls `/api/extract`), `src/components/ui/`, `src/lib/i18n.ts`, `src/lib/help-data.ts`

## Deliverable
1. **Stub-only checking.** Organizers do not know each worker's daily hours or breaks. Define `organizerAnswers(stub, county)`: `{ county, dailyHours: [], gotRestBreaks: "yes", gotMealBreaks: "yes", paidByPiece: stub.payType === "piece" || stub.payType === "mixed" }`. Verify every rule returns `null` (never throws, never invents) when `dailyHours` is empty; `weekly-ot` may still use `hoursWorked`; `min-wage`, `piece-rest`, `math-mismatch`, `stub-incomplete` work from the stub alone. If any rule throws or misbehaves on `[]`, add the smallest guard in that check and a test for it; do not change any existing expected value (`npm test` must stay green). Log what the organizer mode can and cannot detect (it under-counts by design).
2. **`src/lib/fixtures/organizer-samples.ts`**: one fictional employer ("Sunfield Vineyards LLC" from sample 1 is fine) with 6 stubs for 6 different fictional workers over two pay periods, realistic variation (different tray counts and hours; 4 of 6 missing separate rest-break pay, 2 of 6 with gross not matching units × rate, 1 fully correct). Export `organizerSamples` and the expected pattern counts; add a test that the pattern matches.
3. **`/organizer` page** (`src/app/organizer/page.tsx`, client): 
   - Header text: "Organizer view" + one line on what it does, and the privacy line (nothing uploaded is stored).
   - County select (same list as the review page) and an employer name field (optional, text only).
   - Two ways to add stubs: **Add pay stub photos** (multi-file `<input type="file" multiple accept="image/*">`, each downscaled with `src/lib/image.ts` and sent to `/api/extract` with a per-row progress state; live calls take 7–15 s each, run at most 2 in parallel) and **Load sample employer** (the fixture set, instant). Rows can be removed.
   - Results: summary cards (stubs loaded, stubs with issues, total estimated owed), a **pattern list** sorted by frequency ("Rest breaks not paid on top of piece pay — 4 of 6 stubs — $150.68") using titles from `sources.ts`, then a table: worker (initials only, e.g. "M.H."; never the full name), pay period, pay type, hours, gross, issues (short ids or titles), estimated owed. Totals row.
   - **Export CSV** (client-side Blob download) and **Print** (`window.print()`; the existing print pattern from the claim page is a reference, keep it simple).
   - All strings in English and Spanish via `i18n.ts` (prefix `org.`), appended.
   - Desktop-first is acceptable (organizers use laptops) but it must not break at 375 px: table scrolls horizontally inside its container.
4. **Hidden:** no link from the header, footer, home, help or any page. Add `export const metadata = { robots: { index: false } }` via a small `layout.tsx` for the route (server component) so it is not indexed. Niki will decide later whether to link it.
5. Nothing persisted. In-memory state only (a page reload clears it; say so in the UI).

## Done when
- [ ] `/organizer` → Load sample employer → summary shows 6 stubs, 5 with issues, a total, and the top pattern line reads like "Rest breaks not paid … 4 of 6 stubs"
- [ ] Adding `public/samples/sample-1.png` and `sample-3.png` as photos extracts both (live API; costs cents) and adds two rows
- [ ] Export CSV downloads a file with one row per stub plus totals; Print hides the controls
- [ ] No link to `/organizer` exists anywhere in the site; `curl -s localhost:3000/organizer | grep -c noindex` is 1
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` pass
- [ ] Decisions logged in ENGINEERING.md (next free number); Report back filled in **by 3:15pm**

## Constraints
- Do not change any existing rule's amounts, explanations or expected test values. Additive guards only.
- Do not edit package.json or install packages (D-009). No chart library: the pattern list is text plus a simple CSS bar.
- Do not touch `src/app/check/**`, `src/app/api/**`, `src/lib/llm.ts`, `SiteHeader`, `SiteFooter`, home page.
- The planning session's dev server runs on port 3000; test against it read-only.
- Do not commit.

## Out of scope
- Saving sessions, accounts, sharing links
- Per-worker answers inside the organizer view
- Linking the page from the site

## Decisions already made
- D-007 deterministic rules; D-045 layout; organizer mode under-counts by design (log it)

## Decisions you may hit (escalate to Fable 5.1 as Open)
- Whether `weekly-ot` should run with no daily hours (recommend: yes if `hoursWorked > 40`)

## Report back (filled in by the subrunner)
- Status:
- What was built:
- What was NOT done and why:
- Decisions logged: D-___
- Open questions for Fable:
- How to verify:
