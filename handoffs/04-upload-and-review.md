# Handoff 04 — Upload page, review page, session state

- Model: Sonnet
- Depends on: 01 (shell, i18n, ui components), 03 (`/api/extract`), types from 02
- Can run in parallel with: 05, 06
- Estimated time: 75 min

## Goal
A worker can take a photo or upload a file, see "Reading your pay stub...", then review and correct the extracted fields and answer the questions. The data flows to the result page.

## Read first
- CLAUDE.md, ENGINEERING.md (D-006, D-007 and anything logged by 01–03), SETUP.md
- PLAN.md: Pages, Data shapes, Demo script steps 2–4
- `src/lib/i18n.ts`, `src/components/ui/`, `src/lib/types.ts`, `src/app/api/extract/route.ts`, `src/lib/fixtures/samples.ts`

## Deliverable
1. `src/lib/check-state.tsx`: React context `CheckProvider` holding `{ stub?: PayStub; answers?: WorkerAnswers; result?: CheckResult; imagePreview?: string }`, mirrored to `sessionStorage` (try/catch), with `reset()`. Wrap the `/check` segment in it via `src/app/check/layout.tsx`.
2. `src/app/check/page.tsx`: two large buttons, **Take a photo** (`<input type="file" accept="image/*" capture="environment">`) and **Upload a file** (`<input type="file" accept="image/*,application/pdf">`), styled as buttons. Below, a small **Try a sample** link opening a sheet listing the five samples from `samples.ts`; picking one sets `stub` and `answers` from the fixture and goes straight to `/check/review`. If the page is opened with `?sample=1`, open that sheet automatically.
3. On file select: downscale the image client-side to max 1600px on the long side with a canvas, JPEG quality 0.85, show a thumbnail, POST base64 to `/api/extract`, show a progress state with the text "Reading your pay stub..." and a calm indeterminate bar. On success store `stub` and go to `/check/review`. On failure show a friendly error with **Try again** and **Enter details by hand** (goes to review with an empty stub). PDFs: send as-is with mimeType `application/pdf`; if the API rejects, show the by-hand option.
4. `src/app/check/review/page.tsx`: a form with the extracted fields (employer, pay period dates, pay type, hours, hourly rate, piece units, piece rate, rest break pay, gross, net). Low-confidence extraction (confidence < 0.6) shows a yellow notice "Please check these numbers." Then a county dropdown (Central Valley counties first, then "Other California county") and the questions: days worked and hours each day (a row of up to 7 small number inputs with a default of 8), rest breaks (yes / some / no), meal breaks (yes / some / no), paid by the piece (yes / no, pre-set from pay type). Primary button **Check my pay** calls `checkPayStub` from `src/lib/rules` client-side, stores `result`, goes to `/check/result`.
5. All strings in both languages, added to `i18n.ts`.

## Done when
- [ ] On a phone-width viewport, both buttons are visible without scrolling and open the camera / gallery respectively (verify on desktop that the inputs have the right attributes)
- [ ] Try a sample → review → Check my pay reaches `/check/result` with a stored result, with no network and `DEMO_MODE=true`
- [ ] A real file upload hits `/api/extract` and populates the form (DEMO_MODE returns sample 1)
- [ ] Reloading `/check/review` keeps the data (sessionStorage)
- [ ] `npm run lint` passes; decisions logged; Report back filled in

## Constraints
- Do not edit package.json or install packages (D-009). Needed dependency → Open item in your report.
- Use the ui components from 01; do not restyle the shell.
- Do not modify `src/lib/rules/` or `src/lib/llm.ts`; if you need a change, write it in your report as an Open item.

## Out of scope
- Result and claim pages (05)
- Sample stub rendering (06)

## Decisions already made
- D-006: two explicit capture buttons; English default
- D-007: `checkPayStub` is the only source of amounts

## Decisions you may hit (escalate to Fable 5.1)
- Supporting multi-page PDFs (do not; first page only or by-hand)

## Report back (filled in by the subrunner)
- Status:
- What was built:
- What was NOT done and why:
- Decisions logged: D-___
- Open questions for Fable:
- How to verify:
