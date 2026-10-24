# Handoff 06 — Sample stub renderer and PNGs

- Model: Sonnet
- Depends on: 01 (shell), 02 (`samples.ts`)
- Can run in parallel with: 04, 05
- Estimated time: 45 min

## Goal
Each of the five sample stubs renders at `/samples/[id]` as a realistic-looking pay stub so it can be photographed live from a laptop screen during the demo, and a PNG of each exists in `public/samples/` for the Try a sample flow and for the LLM test script.

## Read first
- CLAUDE.md, ENGINEERING.md, SETUP.md
- PLAN.md: Demo script step 2, Samples
- `src/lib/fixtures/samples.ts`

## Deliverable
1. `src/app/samples/[id]/page.tsx`: renders the sample's fields as a pay stub in the style of a real agricultural payroll stub: employer block, employee block (fictional name, last 4 of an ID as "XXXX"), pay period, earnings table (hours/rate/amount or units/rate/amount), deductions, gross, net, check number. Monospace or plain sans font, light gray rules, off-white paper background, slight shadow. No site header or footer on this route (use a bare layout). Add `/samples` index page listing all five.
2. `public/samples/sample-1.png` … `sample-5.png`: screenshots of each rendered stub at about 1200px wide. Produce them with the built-in browser or a headless screenshot; do not hand-draw them.
3. Each sample's `label` is shown on the index, in both languages.

## Done when
- [ ] `/samples/1` looks like a plausible pay stub when viewed full screen on a laptop
- [ ] Five PNGs exist and open correctly
- [ ] `npm run lint` passes; decisions logged; Report back filled in

## Constraints
- Fictional employers and names only. Nothing resembling a real company.
- Do not modify `samples.ts` values (02 owns them); if a field is missing for rendering, report it.

## Out of scope
- Anything in `/check`

## Report back (filled in by the subrunner)
- Status:
- What was built:
- What was NOT done and why:
- Decisions logged: D-___
- Open questions for Fable:
- How to verify:
