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
- Do not edit package.json or install packages (D-009). Needed dependency → Open item in your report.
- Fictional employers and names only. Nothing resembling a real company.
- Do not modify `samples.ts` values (02 owns them); if a field is missing for rendering, report it.

## Out of scope
- Anything in `/check`

## Notes from wave 1 (read these)
- `samples.ts` ids are slugs (`grape-trays`, `almond-sweeping`, `citrus-bins`, `correct-stub`, `unpaid-hours`); `getSample` also accepts 1–5. Route `/samples/[id]` should accept both.
- The dev server on port 3000 belongs to the planning session; if you need your own, use `PORT=3001 npm run dev`.

## Report back (filled in by the subrunner)
- Status: Done. Not committed (per instructions).
- What was built:
  - `src/app/samples/[id]/page.tsx`: renders a sample as an agricultural payroll stub (employer block, check no. and pay date, employee with "Worker ID XXXX", pay period and pay type, earnings table in hours or units, deductions, gross, net, perforated footer). Off-white paper, gray rules, shadow, monospace font. Accepts slug or 1–5, 404 otherwise. The paper is a full-screen overlay so the site header and footer do not show (D-033).
  - `src/app/samples/page.tsx`: index of all five with English and Spanish labels, links to `/samples/1`…`/samples/5`.
  - `public/samples/sample-1.png` … `sample-5.png`: 1200 px wide, 948–1090 px tall, from headless Chrome (D-034). Checked 1, 3, 4, 5 by eye; 2 has the same layout as 1.
- What was NOT done and why:
  - Did not run my own dev server: `next dev` allows one per folder and the planning session's is on port 3000, so I read pages from that one (read-only).
  - `npm run lint` is not fully green: 7 errors, all in `src/app/check/page.tsx` (react-hooks/refs, lines ~189–194, another session's file). `npx eslint src/app/samples` is clean and `tsc` reports nothing for my files.
  - Did not link "Check this sample" from the index to `/check?sample=N` (that flow belongs to 04/05).
- Decisions logged: D-033, D-034
- Open questions for Fable: None. If you want a truly bare layout, the alternative is a route group with its own root layout, which means moving `layout.tsx` and the existing pages.
- How to verify: Open `http://localhost:3000/samples/1` full screen (and `/samples/almond-sweeping`, `/samples`). Open the five PNGs in `public/samples/`. Regenerate a PNG with: Chrome `--headless=new --hide-scrollbars --window-size=1200,1400 --screenshot=out.png http://localhost:3000/samples/N`, then crop the bottom to the paper.
