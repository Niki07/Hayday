# ENGINEERING.md — Decision log

Append-only log of every engineering decision made on this project, by any model or human.
Rule (from `CLAUDE.md`): a decision that is not logged here did not happen.

## How to add an entry
- Append at the bottom, newest last. Never edit or delete an old entry; supersede it with a new one.
- Number entries sequentially: D-001, D-002, ...
- Keep it short. Five lines is fine. The **Why** line matters most.
- Say who decided: Fable 5.1, Opus, Sonnet or Niki.
- Open questions use the same template with `Status: Open` and the question in the Decision line. Only Fable 5.1 (or Niki) resolves them, by adding a new entry.

### Template (copy this)

```
## D-NNN — <short title>
- Date: YYYY-MM-DD HH:MM
- Decided by: <Fable 5.1 | Opus | Sonnet | Niki> (session: <planning | handoff file name>)
- Status: Accepted | Open | Superseded by D-MMM
- Importance: Major | Minor
- Decision: <what was decided, one or two sentences>
- Why: <the reason, including the alternatives rejected and why>
- Consequences / shortcuts: <what this costs, what it makes harder, any hack to clean up later>
```

---

# Log

## D-001 — Model roles: Fable 5.1 plans and decides, Opus and Sonnet implement
- Date: 2026-10-23 23:00
- Decided by: Niki's setup helper (project setup)
- Status: Accepted
- Importance: Major
- Decision: All ideation, planning and important decisions are made by Claude Fable 5.1. Implementation is split into handoff documents and run by Opus (hard tasks) and Sonnet (routine tasks) subrunner sessions. Subrunners escalate important decisions back to Fable instead of deciding.
- Why: Fable 5.1 is the strongest model available, so the decisions that are expensive to get wrong at a hackathon (idea, scope, stack, architecture) go to it. Opus and Sonnet are faster and cheaper for well-specified implementation work, and running several of them in parallel is how the build phase gets done in a day.
- Consequences / shortcuts: Every subrunner needs a clear handoff doc or it will stall. Decisions must be written down here so parallel sessions do not drift apart.

## D-002 — Single append-only decision log at the project root
- Date: 2026-10-23 23:00
- Decided by: Niki's setup helper (project setup)
- Status: Accepted
- Importance: Minor
- Decision: One file, `ENGINEERING.md`, holds all engineering decisions with a fixed template. `CLAUDE.md` makes logging mandatory for every model.
- Why: Several sessions on different models will work at once. A single shared, append-only file is the simplest way for them to see each other's decisions and for Niki to explain the project to judges afterwards.
- Consequences / shortcuts: Two sessions appending at the same moment could clobber each other; keep entries short and re-read the file before writing.

## D-003 — Environment conventions, default stack and DEMO_MODE
- Date: 2026-10-23 23:20
- Decided by: Niki's setup helper (project setup)
- Status: Accepted
- Importance: Major
- Decision: Fixed env variable names in a root `.env` (committed `.env.example`), fixed ports (3000 frontend, 8000 backend), all LLM calls through one wrapper file with OpenRouter as the default provider, a `DEMO_MODE` flag with canned responses required for every external call, and a default stack (Next.js + TypeScript, Tailwind + shadcn/ui, SQLite via Prisma, Vercel) that Fable starts from unless the idea needs otherwise. All in `SETUP.md`.
- Why: Several sessions on different models will touch the same project. Fixed names and ports stop them inventing incompatible conventions. One wrapper file makes provider swaps and demo fallbacks a one-file change. A default stack removes an hour of deliberation and keeps agents on tooling they know well. DEMO_MODE protects the live demo from wifi, credit and API failures.
- Consequences / shortcuts: Deviating from the default stack is a Major decision Fable must log. Fixtures for DEMO_MODE must be kept realistic or the demo looks fake.

## D-004 — Idea locked: Pay stub checker for Central Valley farmworkers
- Date: 2026-10-24
- Decided by: Fable 5.1 with Niki's team (planning)
- Status: Accepted
- Importance: Major
- Decision: Build a bilingual (Spanish/English) web app where a farmworker photographs a pay stub; AI extracts the fields, a small rules engine checks them against California farm labor pay rules, the app shows any underpayment with each rule cited, and generates a prefilled wage complaint. Working name: Pago Justo.
- Why: The judging rubric weights Innovation at 30%. Earlier candidates (heat and smoke shift planner, with field heat index and schedule optimizer twists) were judged too close to "a smarter weather app" that many teams will build from the same prompt. The pay stub checker starts from a different problem, is unlikely to be duplicated, uses AI on a real document plus real rule math (Technical 25%), has a clear named beneficiary and a strong impact story (Impact 20%), and has one instant demo moment (Presentation 15%). Rejected alternatives: voice call-in helper (phone setup risk in 8 hours), shade station planner (map tooling risk), combined pay plus heat log (too big).
- Consequences / shortcuts: Legal accuracy risk. Encode only four or five clear, citable rules; show the citation on screen; label results as an estimate with a pointer to legal aid. Demo uses generated sample pay stubs, not real ones. No real worker data is stored.

## D-005 — Stack: Next.js App Router + TypeScript + Tailwind, no database, Vercel
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Major
- Decision: One Next.js app (App Router, TypeScript, Tailwind, `src/` dir) with two API routes for AI calls. No database and no Prisma: the app stores nothing by design, state lives in the browser session. LLM calls go through OpenRouter via the OpenAI SDK in one wrapper file. Deploy to Vercel.
- Why: Team has no stack preference and already planned on Vercel. Next.js gives frontend plus API routes in one deploy. Dropping the database removes an hour of setup and matches the privacy promise ("we do not save your photo or your name"), which is also a selling point to judges.
- Consequences / shortcuts: Any stretch goal that needs persistence (weekly history, organizer view across sessions) will need browser storage or a later DB decision by Fable.

## D-006 — Product decisions from the team: English default, two capture buttons, calm design
- Date: 2026-10-24
- Decided by: Niki's team with Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: English is the default language with a one-tap Spanish toggle on every page. The upload page offers two explicit actions, "Take a photo" and "Upload a file". Visual design is calm and professional (white space, one accent color, large tap targets) and must not look like a children's app.
- Why: Team judged Spanish-by-default presumptuous. Phone users need camera and gallery as separate, obvious choices. Large targets are for outdoor phone use; sleek styling keeps Design & UX credible with judges.
- Consequences / shortcuts: All copy must exist in both languages from the start; the i18n dictionary is part of the app shell task.

## D-007 — Pay math is deterministic code; AI only reads the image and writes the letter
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Major
- Decision: The AI model does two jobs only: extract structured fields from the pay stub image, and draft the bilingual complaint letter. All rule checks and dollar amounts come from a pure TypeScript rules module with unit tests and an explicit rate table with effective dates. Results are labelled as estimates with a pointer to legal aid.
- Why: Dollar amounts must be consistent, explainable and citable on screen. Deterministic code is testable in the time available and defensible when a judge asks "how do you know". It also keeps the demo stable under DEMO_MODE.
- Consequences / shortcuts: Only a small set of rules is covered (minimum wage, daily/weekly overtime, piece-rate rest break pay, meal/rest premiums, stub completeness, math consistency, unpaid hours). Rate values must be verified against the state labor site by the subrunner, not assumed.

## D-008 — Product name: Hayday
- Date: 2026-10-24
- Decided by: Niki's team (planning)
- Status: Accepted
- Importance: Minor
- Decision: The product is called Hayday. Replaces the working name Pago Justo in PLAN.md and handoffs. Session storage key is `hayday-check`.
- Why: Team choice. Short, memorable, English, farm-flavored, and a play on "payday".
- Consequences / shortcuts: "Hay Day" is also the name of a well-known mobile farming game. Fine for a hackathon; would need a check before any real launch.

## D-009 — package.json is frozen during wave 1; shared dev deps preinstalled
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: `vitest`, `tsx`, `openai` and `zod` are installed and the `test` and `llm:test` scripts exist before any subrunner starts. Subrunners do not edit package.json or install packages; they log an Open item if they need one.
- Why: Three sessions share this folder in parallel. package.json and the lockfile are the one file every task would otherwise touch, and concurrent npm installs corrupt them.
- Consequences / shortcuts: Any new dependency requires a Fable decision.

## D-010 — Design tokens: deep green accent #166534, Inter font
- Date: 2026-10-24 10:30
- Decided by: Sonnet (session: handoffs/01-app-shell.md)
- Status: Accepted
- Importance: Minor
- Decision: Single accent color deep green `#166534` (hover `#14532d`, soft tint `#ecf6ef`) defined as Tailwind theme tokens `accent`, `accent-hover`, `accent-soft` in `globals.css`. Font is Inter via `next/font/google` (replaces Geist from the scaffold) with a system-font fallback stack. Dark mode removed from `globals.css`; `color-scheme: light` is forced.
- Why: Green reads as calm, trustworthy and agricultural without being childish; it passes contrast on white (about 7:1). Blue was the alternative and looks like every fintech app. Inter is what the handoff names.
- Consequences / shortcuts: `next/font/google` fetches Inter at build time, so a build needs network once. Tokens live only in `globals.css`; change them there.

## D-011 — Language state is a tiny external store read with useSyncExternalStore
- Date: 2026-10-24 10:30
- Decided by: Sonnet (session: handoffs/01-app-shell.md)
- Status: Accepted
- Importance: Minor
- Decision: `src/lib/i18n.ts` keeps the language in a module-level store (`localStorage` key `hayday-lang`, wrapped in try/catch) exposed through `useSyncExternalStore`. Server and first hydration render are always English; the saved choice applies right after hydration. `LanguageProvider` also sets `<html lang>`. Pages that show text are client components using `useT()`.
- Why: Reading localStorage during render causes a hydration mismatch, and setting state in an effect trips the lint rules. The external store avoids both. Rejected: cookie plus server rendering (more moving parts, hurts static pages).
- Consequences / shortcuts: A Spanish user sees English for a split second on first load. Pages can no longer export `metadata` if they are client components; the root layout supplies one title for the whole site.

## D-012 — Help page lists only verified organizations, with no phone numbers
- Date: 2026-10-24 10:40
- Decided by: Sonnet (session: handoffs/01-app-shell.md)
- Status: Accepted
- Importance: Minor
- Decision: `/help` lists the CA Labor Commissioner wage claim page, California Rural Legal Assistance (CRLA) and Central California Legal Services (CCLS), grouped by county from the offices their own sites list (crla.org/locations: Fresno, Delano, Lamont, Madera, Modesto, Stockton, Tulare; centralcallegal.org: Fresno, Merced, Visalia). Kings County has no verified office, so it shows the nearest Tulare County offices with a note. Links go to org sites, never phone numbers.
- Why: The handoff forbids invented contact details. Kern's Greater Bakersfield Legal Assistance appeared only in third-party directories and its core areas (housing, family) do not include wages, so it is left out. CCLS's own page does not mention employment, so its blurb says "ask them if they can help with a pay problem". The Kings coverage claim for CCLS came only from search snippets, so it is not asserted.
- Consequences / shortcuts: Coverage is thin for Kern, Kings, Merced and San Joaquin. Fable or Niki may want to add more groups (for example a county-specific one) after checking them. County-to-office mapping is in a data array at the top of `src/app/help/page.tsx`. Verified on 2026-10-24; offices can change.

## D-013 — Home page pay stub picture is an inline SVG with made-up numbers
- Date: 2026-10-24 10:45
- Decided by: Sonnet (session: handoffs/01-app-shell.md)
- Status: Accepted
- Importance: Minor
- Decision: `src/components/PayStubIllustration.tsx` is a hand-drawn SVG with generic numbers (46 hours, $16.50, 212 pieces). Its labels follow the language toggle.
- Why: Handoff bans internet images. The numbers are decoration, not a sample for the rules engine.
- Consequences / shortcuts: It does not match the sample stubs from handoff 06; swap it for a real sample screenshot later if wanted. The Spanish headline "Haga de cada día de pago un Hayday." uses the formal "usted" form, which is a copy choice for Niki to confirm.

## D-014 — Stub pages share one StubPage component; Try a sample links to /check?sample=1
- Date: 2026-10-24 10:45
- Decided by: Sonnet (session: handoffs/01-app-shell.md)
- Status: Accepted
- Importance: Minor
- Decision: `/check`, `/check/review`, `/check/result`, `/check/claim` render `src/components/StubPage.tsx` (a heading and a "coming soon" line). Handoffs 04 and 05 replace each page file. The "Try a sample" link goes to `/check?sample=1` as written in the handoff; that page does not use the query yet.
- Why: Keeps routing working with the least code.
- Consequences / shortcuts: `StubPage` and the `stub.coming` string can be deleted once all four pages are real.

## D-015 — vitest installed with --legacy-peer-deps
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: `vitest@5` is installed as a dev dependency using `--legacy-peer-deps` because of a peer range conflict between `vite@8` and the scaffold's `@types/node@^20`. D-009 claimed it was preinstalled; it was not, because the scaffold was copied before its install finished.
- Why: Upgrading `@types/node` mid-build risks breaking other sessions; the peer warning is harmless for running tests.
- Consequences / shortcuts: Any future `npm install` in this project should also pass `--legacy-peer-deps`.

## D-016 — Answers to handoff 01 open questions
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: (1) Keep the verified `/help` list as is; adding more organizations is a polish task after the demo path works. (2) Formal "usted" Spanish is confirmed for all copy. (3) The brief English flash on first Spanish load is acceptable for the demo; do not spend time on it.
- Why: Demo-first (CLAUDE.md). None of the three affects the demo script.
- Consequences / shortcuts: If time remains in hour 5+, Kern County organizations are the first polish item.

## D-017 — LLM model: anthropic/claude-sonnet-5.5 on OpenRouter
- Date: 2026-10-24 11:10
- Decided by: Opus (session: handoffs/03-llm-and-api.md)
- Status: Accepted
- Importance: Major
- Decision: `LLM_MODEL=anthropic/claude-sonnet-5.5`, in `.env.example` and `.env`. Slug copied from the live list at https://openrouter.ai/api/v1/models on 2026-10-24, which shows input modalities `text,image,file`, 1M context, $2/M input and $10/M output tokens.
- Why: SETUP.md names Sonnet 5.5 as the fast default. It is the newest Sonnet on the list and accepts images. Opus 5.5 ($4/$20) and Fable 5.1 ($10/$50) are slower and dearer for a task Sonnet did perfectly in the live test; Haiku 5.5 is cheaper but riskier on blurry photos. Live test: one clean stub took about 7 s (about 15 s through the route), every field correct.
- Consequences / shortcuts: Changing the model is a one-line edit in `.env`. Vercel needs the same value set (handoff 07).

## D-018 — Extraction prompt: transcribe only, JSON only, lenient zod parsing
- Date: 2026-10-24 11:10
- Decided by: Opus (session: handoffs/03-llm-and-api.md)
- Status: Accepted
- Importance: Minor
- Decision: The system prompt in `src/lib/llm.ts` lists every `PayStub` key with its meaning, asks for one JSON object with null for anything not printed, forbids calculating values (no gross from hours × rate: D-007), wants ISO dates converted from US month/day order, gives Spanish label hints, asks for `rawText` of every line and a `confidence` that drops for blur or glare, and says what to return for a non-stub image. No `response_format`; the reply is parsed by taking the outermost `{...}`. Zod accepts `"$1,234.50"` strings, nulls and `MM/DD/YYYY`, and clamps confidence to 0–1.
- Why: Telling the model to copy, not compute, keeps all math in the rules engine. Lenient parsing turns small format slips into valid data instead of a retry. `response_format` support for Anthropic models through OpenRouter is uneven, and a prompt plus parser works on any model.
- Consequences / shortcuts: `restBreakPay` is filled only when a separate line exists, which is what the `piece-rest` rule needs.

## D-019 — Retry and fallback policy for both AI calls
- Date: 2026-10-24 11:10
- Decided by: Opus (session: handoffs/03-llm-and-api.md)
- Status: Accepted
- Importance: Minor
- Decision: Extraction: on a reply that fails validation, retry once with the assistant's reply and the zod error fed back; on a second failure return `{ payType: "unknown", confidence: 0, rawText }` (rawText rescued from the reply if possible). API errors throw and the route returns 500. Letter: same single retry, plus a check that the total and every finding amount appear in both languages and no other dollar figure does; after a second failure, or on an API error, return the deterministic template letter (`src/lib/fixtures/letters.ts`). Missing `OPENROUTER_API_KEY` or `LLM_MODEL` throws `LlmConfigError` naming the variable. OpenAI SDK: 60 s timeout, 1 automatic retry on 429/5xx. Routes set `maxDuration = 60`.
- Why: One retry fixes most format slips without doubling latency on stage. A broken extraction should still let the worker type values on the review page, but a dead key or no credit must be visible, so API errors are not hidden. For the letter the template is a correct letter, so falling back is safe and keeps the claim page working; the amount check enforces D-007 on AI-written text.
- Consequences / shortcuts: A letter that falls back looks plainer; the server logs a `[llm]` warning when that happens.

## D-020 — /api/extract input limits: 8 MB decoded image, JPEG/PNG/WebP/GIF only
- Date: 2026-10-24 11:10
- Decided by: Opus (session: handoffs/03-llm-and-api.md)
- Status: Accepted
- Importance: Minor
- Decision: The route rejects bodies over about 10.7 MB (base64 of 8 MB plus 64 KB) by `content-length`, then rejects decoded images over 8 MB with 413. Accepted `mimeType`: `image/jpeg` (also `image/jpg`), `image/png`, `image/webp`, `image/gif`; anything else, including HEIC, is a 400. A `data:...;base64,` prefix is stripped if sent. Error bodies are `{ error: code, message }`.
- Why: 8 MB is the handoff's limit. These four types are what Claude vision accepts.
- Consequences / shortcuts: 8 MB is above two real limits: Anthropic's 5 MB per image and Vercel's 4.5 MB request body for functions. On Vercel, anything over about 3.3 MB of image fails before reaching the route. See D-022.

## D-021 — DEMO_MODE fixtures: local demo stub, template letter built from the input
- Date: 2026-10-24 11:10
- Decided by: Opus (session: handoffs/03-llm-and-api.md)
- Status: Accepted
- Importance: Minor
- Decision: In DEMO_MODE `extractPayStub` returns `demoStub` from `src/lib/fixtures/demo-stub.ts` after 1.5 s, because `src/lib/fixtures/samples.ts` (handoff 02) did not exist yet. `writeClaimLetter` returns `buildTemplateLetter(input)` after 0.8 s: a fixed bilingual template filled from the real findings, not a frozen letter.
- Why: A frozen letter would show amounts that do not match the result page as soon as the rules or samples change. The template always matches, and it doubles as the fallback in D-019.
- Consequences / shortcuts: Shortcut to clean up: once `samples.ts` lands, switch `extractPayStub`'s demo branch to `samples[0].stub` and delete `demo-stub.ts`, so DEMO_MODE extraction matches sample 1 exactly. The demo stub is a 48-hour grape piece-rate stub (412 trays × $1.10).

## D-022 — Open: downscale photos in the browser before upload (handoff 04)
- Date: 2026-10-24 11:10
- Decided by: Opus (session: handoffs/03-llm-and-api.md), needs Fable 5.1
- Status: Open
- Importance: Major
- Decision: Question for Fable: should handoff 04 resize every photo in the browser (canvas, long edge about 1600 px, JPEG quality about 0.85, usually 200–600 KB) before calling `/api/extract`? Recommendation: yes.
- Why: Phone photos are often 3–8 MB. Vercel rejects request bodies over 4.5 MB and Anthropic rejects images over 5 MB, so full-size photos will fail in production even though they pass locally. Claude shrinks anything over about 1568 px on the long edge anyway, so a smaller upload loses no accuracy. Drawing to a canvas and exporting JPEG also turns iPhone HEIC into JPEG in Safari, which the route requires (D-020). Smaller uploads are also faster on rural cell signal.
- Consequences / shortcuts: About 20 lines in 04's upload code. Without it, the live demo must use small images.

## D-023 — Resolves D-022: photos are downscaled in the browser before upload
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted (closes D-022)
- Importance: Minor
- Decision: Handoff 04 downscales images client-side to a 1600 px long edge, JPEG quality 0.85, before POSTing to `/api/extract`. This was already in the handoff; 03's analysis (Vercel 4.5 MB body limit, Anthropic 5 MB image limit, HEIC conversion) confirms it is required, not optional.
- Why: Phone photos routinely exceed 3 MB. Downscaling also converts HEIC from iPhones to JPEG, which the API accepts.
- Consequences / shortcuts: Review page must handle `payType: "unknown"` with `confidence: 0` by offering manual entry (03's note).

## D-024 — Verified pay rates used by the rules engine
- Date: 2026-10-24
- Decided by: Opus (session: handoffs/02-rules-engine.md)
- Status: Accepted
- Importance: Major
- Decision: `src/lib/rules/rates.ts` holds the California minimum wage $15.50 (2023), $16.00 (2024), $16.50 (2025), $16.90 (2026-01-01), the same for all employer sizes since 2023. Local ordinance table is empty. Farmworker overtime is 1.5x after 8 h/day or 40 h/week and 2x after 12 h/day.
- Why: Verified online this session. Minimum wage: dir.ca.gov/dlse/faq_minimumwage.htm and dir.ca.gov/dlse/minimum_wage.htm. Local: the UC Berkeley Labor Center inventory (the list DIR links to) has 40 California localities, none in a Central Valley county. Overtime: dir.ca.gov/dlse/Overtime-for-Agricultural-Workers.html (8/40 and 2x after 12 for 26+ employees since 2022-01-01, for 25 or fewer since 2025-01-01). Matches PLAN.md; no contradiction to escalate.
- Consequences / shortcuts: Employer size is not modeled. For 2024 periods a small employer's real threshold was 8.5/45, so 2024 overtime could be overstated for small employers. The 2027 rate is not published yet; add it when DIR announces it.

## D-025 — Rounding: cents, half up, rates rounded before use
- Date: 2026-10-24
- Decided by: Opus (session: handoffs/02-rules-engine.md)
- Status: Accepted
- Importance: Minor
- Decision: The regular/average hourly rate is rounded to cents first, then each finding is computed from that rounded rate and rounded to cents (half up). `totalOwed` is the sum of the rounded findings.
- Why: The explanation shows the arithmetic ("10 hours × $22.60 × 0.5 = $113.00"). Rounding the rate first makes every number on screen check out with a calculator. Rejected: full precision until the end, which gave answers a cent off from the shown math.
- Consequences / shortcuts: Amounts can differ from a payroll system's by a cent or two per finding.

## D-026 — Piece-rate average hourly rate
- Date: 2026-10-24
- Decided by: Opus (session: handoffs/02-rules-engine.md)
- Status: Accepted
- Importance: Major
- Decision: Average hourly rate = straight earnings ÷ hours, where straight earnings = piece units × piece rate (else gross − overtime pay − rest-break pay) and hours = `hoursWorked` on the stub (else the worker's reported total). The same rate, floored at the minimum wage, is used for piece-rest pay, overtime premium, and meal/rest premiums.
- Why: Labor Code § 226.2 divides pay for the week (excluding rest-break pay and overtime premium) by hours worked. Using stub hours keeps min-wage and unpaid-hours from double counting: min-wage covers recorded hours, unpaid-hours covers the extra ones at minimum wage. One rate everywhere keeps it explainable.
- Consequences / shortcuts: § 226.2 excludes rest-break time from the hours. We do not, which slightly understates the rate and the amounts (conservative). The explanation says so.

## D-027 — How stub fields are read (agreed with handoff 03's extractor)
- Date: 2026-10-24
- Decided by: Opus (session: handoffs/02-rules-engine.md)
- Status: Accepted
- Importance: Major
- Decision: `hoursWorked` is total hours including overtime hours (as handoff 03's prompt says). On hourly stubs, regular pay = (hoursWorked − overtimeHours) × hourlyRate and the overtime premium already paid = overtimeHours × (overtimeRate − hourlyRate). On piece stubs, an overtime line counts entirely as premium, since piece pay already covers straight time. Overtime owed is computed from the worker's `dailyHours`. Paid premium offsets daily overtime first, then weekly.
- Why: These are the most common stub layouts. A single definition stops 03, 04 and 02 from drifting.
- Consequences / shortcuts: If the extractor returns regular-only hours in `hoursWorked`, unpaid-hours and math-mismatch will be off by the overtime hours. Overtime rules return nothing without `dailyHours`.

## D-028 — Reading the break answers
- Date: 2026-10-24
- Decided by: Opus (session: handoffs/02-rules-engine.md)
- Status: Accepted
- Importance: Minor
- Decision: "some" means one missed day (the minimum we can be sure of): one premium hour, and for piece-rest the first qualifying day is left out. "no" means every qualifying day. Piece workers who answered "no" to rest breaks get rest-premium, not piece-rest (no break was taken, so there is no break time to pay). Meal break needed on days over 5 h. Rest breaks: none under 3.5 h, otherwise ceil((h − 2) ÷ 4) ten-minute breaks (one per 4 hours or major fraction).
- Why: The worker answers yes/some/no once for the whole period. Counting one day for "some" never overstates, and the explanation tells the worker they may be owed more.
- Consequences / shortcuts: Under-counts workers who missed most breaks but answered "some". Ignores the 6-hour meal waiver and second meal breaks after 10 hours.

## D-029 — Rules engine simplifications and thresholds
- Date: 2026-10-24
- Decided by: Opus (session: handoffs/02-rules-engine.md)
- Status: Accepted
- Importance: Minor
- Decision: Minimum wage date = periodStart (else periodEnd, else newest rate). `dailyHours` are split into workweeks by pay period length (else 7 entries per week). Weekly overtime counts only the first 8 hours of each day. Unpaid hours need 15 minutes or more of difference; piece workers' unpaid hours are paid at the minimum wage (§ 226.2 nonproductive time), hourly at max(rate, minimum). math-mismatch tolerates $1.00, counts only shortfalls as owed, skips the gross check on mixed stubs, and cites § 226(a) (accurate statement) rather than nothing. stub-incomplete checks only the PLAN.md items, adds $0 and mentions the § 226(e) penalty without computing it. No seventh-day rule, no split-shift or reporting-time pay.
- Why: These cover the common cases in the time available. Each choice errs toward the lower amount.
- Consequences / shortcuts: All of the above can be refined after the hackathon. The employee name is not checked by stub-incomplete (extractors miss it often; not in PLAN.md's list).

## D-030 — Sample stubs and the demo total ($184.47)
- Date: 2026-10-24
- Decided by: Opus (session: handoffs/02-rules-engine.md)
- Status: Accepted
- Importance: Minor
- Decision: `src/lib/fixtures/samples.ts` has five samples: `grape-trays` (demo: piece-rest $37.67 + daily-ot $113.00 + unpaid-hours $33.80 = $184.47), `almond-sweeping` ($103.70), `citrus-bins` ($152.90), `correct-stub` ($0), `unpaid-hours` ($80.00). Together they trigger all nine rules. Sample 1 uses 03's employer and worker names with new numbers (1142 trays at $0.95, 48 h on the stub, 5 × 10 h worked, Sept 14–20 2026).
- Why: The handoff asked for "near $184.50". The amounts come from the real arithmetic, not from tuning to a round number. $184.47 is within the $1 the handoff allows.
- Consequences / shortcuts: The demo script and slides should say $184.47. Handoff 03's `demo-stub.ts` should now return `samples[0].stub`; its current numbers (412 trays at $1.10) give a different result.

## D-031 — vite installed as a dev dependency (addendum to D-015)
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: `vite` is installed alongside `vitest@5`, which needs it as a peer, again with `--legacy-peer-deps`.
- Why: `npm test` failed with "Cannot find package 'vite'" after D-015. With vite present the rules suite (48 tests) runs in about 150 ms.
- Consequences / shortcuts: None beyond D-015.

## D-032 — Demo total is $184.47; wave-1 follow-ups
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: The demo headline amount is $184.47 (sample `grape-trays`, D-030), replacing the $184.50 placeholder in PLAN.md. Handoff 03's `demo-stub.ts` is replaced by `samples[0].stub` (03 does this). Handoff 04 labels the hours field "Total hours" (D-027). Handoffs 04 and 05 use the `/api/extract` error shape and timings from 03's report.
- Why: Keep every number on screen, in the plan and on the slides identical.
- Consequences / shortcuts: None.

## D-033 — Sample stub page covers the site chrome instead of using a separate root layout
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/06-sample-stubs.md)
- Status: Accepted
- Importance: Minor
- Decision: `/samples/[id]` renders its paper inside a `fixed inset-0` overlay that hides the site header and footer from the root layout. `/samples` (the index) keeps the normal layout. The page awaits `params` inside a `<Suspense>` boundary and exports `generateStaticParams` for the five slugs and 1–5, because `cacheComponents` is on (next.config.ts) and the dev overlay flagged the route otherwise. Unknown ids return 404.
- Why: A truly bare layout needs a route group with its own root layout, which means moving `layout.tsx` and every existing page (not mine to move). The overlay gives the same result on screen and in a photo.
- Consequences / shortcuts: The header and footer are still in the DOM behind the overlay. Tab order could reach them. Irrelevant for a demo page.

## D-034 — Stub fields the type lacks are hardcoded in the page; PNGs are headless Chrome crops
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/06-sample-stubs.md)
- Status: Accepted
- Importance: Minor
- Decision: Street address, city, employer ID, crew, check number and worker ID ("XXXX") live in an `extras` map in `src/app/samples/[id]/page.tsx`, keyed by sample id; `samples.ts` is untouched. Pay date is the period end + 5 days. The main earnings line shows gross minus the overtime line, so every stub adds up to its own gross (for `unpaid-hours` hours × rate is $630 but the line shows $620, which is the planted error). A small footer says the stub is a fictional sample. `public/samples/sample-1.png`…`sample-5.png` come from `Google Chrome --headless=new --window-size=1200,1400` against `/samples/N`, then cropped to the paper with a few lines of Python/PIL (about 1200 × 950–1090 px).
- Why: No new fields in the shared PayStub type. Headless Chrome needs no installed package (D-009).
- Consequences / shortcuts: If a sample's numbers change in `samples.ts`, the PNGs must be regenerated by hand (same command; the cropping script is not saved in the repo). Addresses and IDs are invented and not read by the rules engine.

## D-035 — Final logo: crossed wheat ear and gavel, cream and brown-orange
- Date: 2026-10-24
- Decided by: Niki's team with Fable 5.1
- Status: Accepted
- Importance: Minor
- Decision: The logo is a wheat ear crossed with a gavel in an X, dark brown (#7A3A10) and orange (#C2651F) on cream (#F6ECD9). Sources in `design/logo/` (tile and transparent "mark" SVGs plus 1024 px PNGs). `src/app/icon.svg` is the tile (browser tab icon via Next's file convention). `public/brand/hayday-logo-mark.svg` is used in `SiteHeader` at 32 px next to the wordmark. Draft rounds remain in `design/logo-options/`.
- Why: Team chose "field gavel" (law meets farm work) over wheat-dollar, bale-check, coin and hat options, then iterated five rounds for clarity: realistic mallet, tidy grain ear, no base, symmetric X, grains clear of the handle.
- Consequences / shortcuts: The site accent is green (D-010) while the logo is brown-orange; whether to move the accent to the logo palette is an open styling question for Niki.

## D-036 — Accent color moved from green to the logo's brown-orange (supersedes the color in D-010)
- Date: 2026-10-24
- Decided by: Niki's team with Fable 5.1
- Status: Accepted
- Importance: Minor
- Decision: `--color-accent` is `#C2651F`, hover `#A3521A`, soft tint `#FBF1E6`, in `globals.css` only. Inter font and everything else in D-010 stand.
- Why: The final logo (D-035) is brown-orange on cream; one brand color across site and slides. White on `#C2651F` is about 4.6:1, enough for the large button text used here.
- Consequences / shortcuts: Body text stays near-black; the accent is only for buttons, the wordmark and the headline amount. Draft numbering note: D-033 and D-034 belong to handoff 06; the logo entry was renumbered to D-035.

## D-037 — Result and claim pages: structure, "looks correct" rule and print approach
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/05-result-and-claim.md)
- Status: Accepted
- Importance: Minor
- Decision: `/check/result` reads from `useCheck()` (handoff 04's provider). Findings with severity `info` go in a smaller "Also noticed" group; everything else is a card sorted by amount. The green "This pay stub looks correct" state shows when `totalOwed === 0` and there is no high or medium finding, and lists `checkedRules` with plain names (`result.rule.<id>` strings). If `totalOwed` is 0 but a high or medium finding exists, the headline reads "We found problems on this pay stub" instead of "$0.00". Cards hide the amount when it is 0. The green state uses Tailwind green, not the accent, because the accent is now brown-orange (D-036). "Prepare my claim" is hidden in the green state. An extra ghost link "Change my answers" goes to `/check/review`. Severity is shown as a dot plus a text label so it is not colour-only.
- Why: Follows the handoff. The $0 headline case and the hidden claim button are small gaps the handoff did not cover; showing "You may be owed $0.00" or offering a claim letter for a correct stub would be wrong.
- Consequences / shortcuts: None.

## D-038 — Claim page: letter is requested on load, cached in memory, name regenerates it
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/05-result-and-claim.md)
- Status: Accepted
- Importance: Minor
- Decision: `/check/claim` POSTs `{ stub, answers, result, workerName? }` to `/api/claim-letter` on load. Letters are cached in a module-level `Map` keyed by the result plus name plus attempt, with one shared in-flight promise per key (so React's double effect run in dev makes one request). The optional name field is local state only; "Update my letter" (or Enter) regenerates the letter with `workerName`, which is a second 8–10 s call. "Download PDF" is `window.print()`; `print.css` (imported by the page) hides `body > header`, `body > footer` and `.no-print`, shows both letters regardless of the mobile tab, puts a page break after each letter, and prints a third page with a bilingual findings table and disclaimer. Mobile uses tabs (default tab = the UI language), desktop (lg) shows two columns. "Copy text" uses `navigator.clipboard`, with a message if it fails.
- Why: The handoff asks for load-time generation and a name field; regenerating on request is the simplest way to let a name appear in the letter. The cache keeps back-and-forth between result and claim instant. No PDF library, per D-009.
- Consequences / shortcuts: The cache lives only until reload. The name is also sent to the model provider while writing the letter (as the existing route allows); nothing is stored by Hayday. The print table headings are "English / Spanish" pairs taken from `i18n.ts` directly. Chrome and Safari both offer "Save as PDF" in the print dialog; the on-screen hint says so. `check-state.tsx`'s header comment still mentions `clearStoredCheck()` in `stored-check.ts`; that file was a temporary reader of the same sessionStorage key and was deleted once the provider landed (comment is stale, harmless).

## D-039 — Check state: external store over sessionStorage, shared key, small thumbnail
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/04-upload-and-review.md)
- Status: Accepted
- Importance: Minor
- Decision: `src/lib/check-state.tsx` keeps `{ stub, answers, result, imagePreview }` in sessionStorage key `hayday-check` and reads it with `useSyncExternalStore`, re-parsing only when the raw string changes. `CheckProvider` (wrapped around `/check` in `src/app/check/layout.tsx`) exposes `useCheck()` with `ready`, `start(next)` (replace all, clears result), `update(patch)` and `reset()`. `ready` is false during hydration; the review page renders its form only once ready so the form starts from stored data. The stored `imagePreview` is a 320 px JPEG thumbnail (about 13 KB), not the upload; if sessionStorage is full it is dropped first.
- Why: Same pattern as D-011, avoids hydration mismatches and setState-in-effect lint errors. Reading the raw key each snapshot keeps it in step with handoff 05's `stored-check.ts` (`clearStoredCheck`), which writes the same key without telling this module. Storing the 1600 px photo would blow the sessionStorage quota.
- Consequences / shortcuts: Handoff 05 may keep using `stored-check.ts` or switch to `useCheck()`; both read and write the same JSON. A private-mode browser that blocks sessionStorage loses state on reload (in-memory fallback only until the next write).

## D-040 — Upload page: client downscale, PDFs sent as-is, error handling
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/04-upload-and-review.md)
- Status: Accepted
- Importance: Minor
- Decision: `src/lib/image.ts` draws the chosen image on a canvas (white background, long edge 1600 px, JPEG 0.85) and POSTs the base64 to `/api/extract`. PDFs are sent unchanged with `application/pdf`; `/api/extract` does not accept that type (D-020), so a PDF gets a 400 and the worker sees "We cannot read that kind of file" with the by-hand option. No multi-page handling. A request that takes more than 75 s is aborted. Errors map to a friendly message by code (too_large, bad_request, network, other) and always offer **Try again** (re-sends the already prepared file) and **Enter details by hand** (empty stub with `payType: "unknown"`, no confidence, so the review page shows the by-hand intro). `payType: "unknown"` with `confidence: 0` from the API goes to review with an amber "could not read this stub" notice.
- Why: Handoff says PDFs as-is and no multi-page support. The 75 s timeout is above the route's `maxDuration` of 60 s so a server timeout surfaces as a server error first.
- Consequences / shortcuts: PDF upload is effectively a dead end until the route accepts PDFs (Open item for Fable: either accept `application/pdf` in the route and handle it in `llm.ts`, or drop PDF from the file picker's `accept`). Chrome on desktop cannot decode HEIC, so it shows the "could not open that picture" error; phones convert it fine. The "Try a sample" sheet uses native `<dialog>`.

## D-041 — Review form rules: required answers, defaults, conditional fields
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/04-upload-and-review.md)
- Status: Accepted
- Importance: Minor
- Decision: County, rest breaks and meal breaks have no default when the stub came from a photo or by hand; "Check my pay" shows inline errors until they are answered (samples arrive with answers, so that path has no friction). Days worked is a 1–7 selector (default 5) with one hours input per day (default 8; each must be 1–24). "Paid by the piece" is pre-set from the pay type (piece or mixed = yes). Hourly fields (rate, overtime hours and rate) hide when the pay type is "piece" and the extractor found none, and piece fields hide for "hourly" likewise; a value the extractor did find always stays visible. I added overtime hours and rate fields to the handoff's list because `hoursWorked` handling in D-027 depends on them. Counties are stored as plain names ("Fresno", "San Joaquin") matching `samples.ts`; anything outside the eight Central Valley counties is stored as "Other". The form fields are strings until submit; the stub keeps the extractor's `rawText`, `deductions`, `employeeName`, `pieceUnitName` and `confidence`.
- Why: A silent default of "yes" to rest/meal breaks would hide premiums the worker may be owed; asking costs one tap each and is demo step 4 anyway. Showing only relevant fields keeps the phone form short. Pay periods longer than 7 days are not supported, per the handoff ("up to 7 inputs").
- Consequences / shortcuts: A biweekly pay period only captures one week of daily hours, so overtime on the second week is not checked. Changing the pay type does not re-sync "paid by the piece".

## D-042 — PDFs are not accepted in the file picker (resolves handoff 04's open question)
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: The "Upload a file" picker accepts images only. `/api/extract` keeps rejecting PDFs (D-020). A worker with a PDF stub takes a screenshot of it.
- Why: Demo-first. PDF support needs page rendering or a model path that takes documents; not worth an hour today. Offering a format that always fails is worse than not offering it.
- Consequences / shortcuts: Mention "screenshot your PDF" in the upload help text if time allows. Handoff 05's `stored-check.ts` can stay.

## D-043 — `.npmrc` sets legacy-peer-deps for every install, including Vercel's
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: `.npmrc` at the root with `legacy-peer-deps=true`, so `npm install` on Vercel (and any fresh clone) succeeds despite the vitest/vite peer range conflict (D-015, D-031).
- Why: First production deploy failed at `npm install`. Project is deployed in `DEMO_MODE=true` first; the API key is added by Niki and the flag flipped to `false` afterwards.
- Consequences / shortcuts: Peer warnings are hidden project-wide. Fine for a hackathon.

## D-044 — Production URL: https://hayday-sigma.vercel.app
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: Vercel project `hayday` (scope diki8), production alias `https://hayday-sigma.vercel.app`. Deployed with `npx vercel deploy --prod --yes` from this folder; no Git integration. Per-deployment `*-diki8.vercel.app` URLs require a Vercel login (default deployment protection), so the alias is the one to share. Env: `LLM_MODEL`, `DEMO_MODE` set from the CLI; `OPENROUTER_API_KEY` is added by Niki herself so the planning session never handles the secret.
- Why: Vercel was the team's choice; CLI deploy avoids needing a GitHub repo today.
- Consequences / shortcuts: Every redeploy is a manual `vercel deploy --prod`. `DEMO_MODE` is `true` until the key is in; then flip to `false` and redeploy.

## D-045 — PDF in one language, sample buttons hidden, help buttons prominent
- Date: 2026-10-24
- Decided by: Niki's team with Fable 5.1
- Status: Accepted
- Importance: Minor
- Decision: (1) The claim page shows one letter at a time with an English/Español tab on every screen size, and "Download PDF" prints only the selected letter plus a findings table in that language. (2) The visible "Try a sample" buttons are removed from the home and upload pages; `/check?sample=N` still opens the sample sheet for demos. (3) "Find free legal aid" (`/help`) and "How to file a wage claim" (Labor Commissioner page, new tab) appear as a pair of full-width buttons on the result page and directly under Download PDF on the claim page.
- Why: Niki's feedback after the first live run: a worker wants the letter in their own language, the sample button looks odd to a real user, and the two actions that actually get money back were buried at the bottom.
- Consequences / shortcuts: The demo now starts from the `/check?sample=1` link or from photographing `/samples/1` on screen; DEMO.md must say so.

## D-046 — Home privacy box removed; bilingual /terms page added
- Date: 2026-10-24
- Decided by: Niki's team with Fable 5.1
- Status: Accepted
- Importance: Minor
- Decision: The "Your privacy" card on the home page is removed (the footer already says it). A `/terms` page, linked from the footer as "Terms and privacy", states in plain English and Spanish: no data is saved; results are guidance, not legal advice, and not legally binding on the worker or the employer; what is checked and where rates come from; that retaliation is illegal and claims are free and do not require immigration papers; that this is a one-day hackathon prototype.
- Why: Niki's feedback; judges and legal aid partners will look for exactly this disclaimer.
- Consequences / shortcuts: The rights paragraph is general public guidance, not tailored advice; wording should be reviewed by a legal aid organization before any real launch.

## D-047 — Law link URLs: how they were verified, and the § 226.7 quirk
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/08-trust-batch.md)
- Status: Accepted
- Importance: Minor
- Decision: `src/lib/rules/sources.ts` links Labor Code sections to `leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=N`, Wage Order 14 to `dir.ca.gov/IWC/IWCArticle14.pdf` (DIR's index lists it as #14-2001), minimum wage to `dir.ca.gov/dlse/minimum_wage.htm`, and farm overtime to `dir.ca.gov/dlse/Overtime-for-Agricultural-Workers.html`. The three dir.ca.gov URLs returned 200 with curl today. leginfo sits behind a Cloudflare browser challenge, so curl gets 403 for every URL on the host, including its home page; that says nothing about our links. Instead each section was opened in the built-in browser and showed the right statute text: 226, 226.2, 512, 857 (Chapter 6, Agriculture), 1182.12, 1194. Section 226.7 has two versions, so leginfo lands on a "pick a version" page (Amended 2020 Ch. 343 Sec. 2, and the newer one); there is no deep link around it.
- Why: Handoff said curl every URL and confirm 200. For leginfo that is impossible, so a real browser was the honest check. Rejected for 226.7: Justia (also 403, and unofficial) and the 200 KB chapter page (the section is buried in it).
- Consequences / shortcuts: The § 226.7 citation links to leginfo's version picker; the worker picks the newest entry. The rules page labels the 226.7 link "pick the newest version". No Open item: every citation string has a URL.

## D-048 — Trust batch UI choices (result strip, home line, county help)
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/08-trust-batch.md)
- Status: Accepted
- Importance: Minor
- Decision: (1) "Checked against California law" strip sits directly under the headline in both states, a `<details>` that is open from 640 px up and closed on phones, and always open in the green state. In the green state it replaces the old ✓ checklist, which listed the same rules without links. (2) The home trust line also names § 1182.12, because the minimum-wage check cites it; the handoff's sentence listed only 226, 226.2, 226.7, 512, 857 and 1194. (3) `effective` in `sources.ts` is set only where verified in `rates.ts`: minimum wage 2026-01-01 and farm overtime 2025-01-01 (fully phased in; the 2022 date for larger employers is in the explanation). Statute sections have no `effective` because no amendment date was verified. (4) The result page keeps the disclaimer line, adds a note that pay rules are the same in every county, shows the county's entries (statewide CRLA and Central California Legal Services with no office line for "Other"), then the claim button, plus a small "See all legal aid offices" link to `/help` so the old route stays reachable. Kings County keeps its "nearest offices" note. (5) `result.rule.*` i18n keys are now unused by the result page; left in place (append-only).
- Why: (2) the home line should not claim fewer laws than the app checks. (3) never publish a date we did not verify. (4) the generic help button went away, so a link to the full list keeps `/help` one tap from the result.
- Consequences / shortcuts: For "Other California county" the statewide organizations are Central Valley focused; no better statewide list was verified. The county note on the result page and the `/rules` intro are the only statements about county scope.

## D-049 — New test file for sources.ts; unpaid-hours citation in the table
- Date: 2026-10-24
- Decided by: Sonnet (session: handoffs/08-trust-batch.md)
- Status: Accepted
- Importance: Minor
- Decision: Added `src/lib/rules/__tests__/sources.test.ts` (no existing test or rule logic changed). It checks that `RULE_SOURCES` has the same ids in the same order as `RULES`, that `citationUrl` links the first section of each citation format, and that for every finding the five samples produce, `citationUrl(finding.citation)` equals its rule's `url`. The `unpaid-hours` table citation is the piece-rate form "§§ 1194, 226.2"; the hourly check emits "§ 1194", and both link to § 1194.
- Why: Without it, a changed citation string in a check would silently lose its link. The strip shows one citation per rule, so the broader form is shown.
- Consequences / shortcuts: Test count went from 48 to 52.

## D-050 — Answers to handoff 08 open questions
- Date: 2026-10-24
- Decided by: Fable 5.1 (planning)
- Status: Accepted
- Importance: Minor
- Decision: (1) The § 226.7 link landing on leginfo's version picker is acceptable; the link label already says to pick the newest version. (2) Keep § 1182.12 in the home trust line; it is the minimum wage section and belongs there. (3) The statewide pair for "Other California county" stays as is; CRLA serves rural California statewide.
- Why: None of the three affects the demo; time goes to the recording and slides.
- Consequences / shortcuts: A legal aid reviewer may want a better statewide list later.

## D-051 — "No pay stub? Enter what you know" is a visible option on the upload page
- Date: 2026-10-24
- Decided by: Niki's team with Fable 5.1
- Status: Accepted
- Importance: Minor
- Decision: The by-hand entry path that handoff 04 built for extraction failures is now a visible button on `/check`, with a note that employers must provide a stub every payday. In by-hand mode the review page shows a notice that a missing stub is itself a Labor Code § 226 problem and that the worker's own hours notes count as evidence. No rule changes.
- Why: Niki's idea. Many farmworkers never receive a stub; this turns a dead end into a finding and gives a path that needs no photo and no AI.
- Consequences / shortcuts: By-hand checks can only run the rules that the entered numbers support; the engine already handles missing fields.

## D-052 — Organizer view checks stubs alone, plus two labelled stub-only estimates (closes handoff 09's weekly-ot question)
- Date: 2026-10-24 13:37
- Decided by: Fable 5.1 (via Opus subrunner, handoff 09)
- Status: Accepted
- Importance: Major
- Decision: `src/lib/rules/organizer.ts` has `organizerAnswers(stub, county)` exactly as the handoff says (`dailyHours: []`, breaks "yes", `paidByPiece` for piece or mixed) and `checkStubOnly(stub, county)`, which runs `checkPayStub` with those answers and then adds two estimates by calling the existing `pieceRest` and `weeklyOt` checks with assumed days: piece-rest assumes a 5-day week (weeks = round(period days ÷ 7), at least 1, 1 without dates; hours spread evenly; capped at the period's calendar days); weekly-ot assumes 8-hour days, so it is exactly (hours − 40 × weeks) × rate × 0.5 minus overtime already on the stub, and never invents daily overtime. Their explanations are replaced with short organizer sentences, and `OrganizerResult.estimated` lists their ids so the page, CSV and print mark them "est.". No existing check, amount, explanation or test value changed; `Finding` is unchanged. Opus verified that with empty `dailyHours` nothing throws and daily-ot, weekly-ot, piece-rest, meal-premium, rest-premium and unpaid-hours all return null (test added), so no guards were needed. What the organizer view can detect: min-wage (from stub hours), math-mismatch, stub-incomplete, piece-rest (estimate), weekly-ot (estimate). What it cannot: daily overtime, missed meal or rest breaks, unpaid hours, anything on a stub with no hours printed. It under-counts by design; sample 1 gives piece-rest $37.67 (same as the worker path) plus weekly-ot $90.40 instead of the worker path's daily-ot $113.00 and unpaid-hours $33.80.
- Why: Organizers never have each worker's daily hours, so without an assumed schedule the strongest systematic pattern (unpaid piece-rate rest breaks, LC § 226.2) is invisible to the organizer view; a 5-day-week assumption reuses the existing check arithmetic unchanged, matches the worker path exactly for sample 1, deliberately under-counts (6-day weeks and daily OT are ignored), and is labelled as an estimate on the page, in the CSV and in print, so D-007 (rules module is the only source of dollar amounts) and the "no rule changes" constraint both hold. Rejected: the handoff as written (piece-rest can never fire with no days, so the headline pattern would be lost), and a $0 "flag only" piece-rest finding (loses the dollar figure).
- Consequences / shortcuts: A caveat line is always shown with results ("Organizer view checks the stub only. Rest-break pay assumes a 5-day week; …") and is the last row of the CSV. With no period dates and more than 56 hours, the weekly estimate splits days into weeks of 7 and comes out lower still. `checkStubOnly` is only called from `/organizer`.

## D-053 — Organizer view build choices: fixture, titles, layout, CSV
- Date: 2026-10-24 13:37
- Decided by: Opus (session: handoffs/09-organizer-view.md)
- Status: Accepted
- Importance: Minor
- Decision: (1) `src/lib/fixtures/organizer-samples.ts`: six Sunfield Vineyards LLC grape pickers, Fresno, weeks of Sept 14 and Sept 21 2026, all piece rate at $0.95 a tray, 34–40 hours (under 40 a week so weekly-ot stays out of the sample pattern), deductions generated from gross so net always matches. Result: piece-rest 4 of 6 ($158.59 est.), math-mismatch 2 of 6 ($60.00), 5 of 6 with issues, $218.59 total; P.R. is correct. `organizerExpected` holds per-stub and pattern values and a test checks them. (2) Pattern and issue labels use each finding's own title ("Rest breaks not paid on top of piece pay"), not the neutral rule names in `sources.ts` ("Paid rest breaks for piece-rate work"), because the pattern list names problems; the Done line in the handoff uses the finding wording. Patterns sort by count, then amount, then RULES order. (3) The county list is copied from the review page (same values and i18n keys) because `src/app/check/**` is off limits for this handoff; "Other" is passed to the rules as "Other", exactly as the review page does. (4) Page is wider than the worker pages (`max-w-5xl`); the table has a 760 px minimum width and scrolls inside its own container at 375 px. (5) Route `layout.tsx` sets `robots: { index: false, follow: false }` and the tab title "Organizer view · Hayday". (6) CSV: initials only, one row per stub, a totals row, the caveat as the last row, UTF-8 BOM for Excel, columns in the current language. Print uses its own `org-`prefixed print stylesheet so it cannot affect `/check/claim`. (7) Photos: at most 2 extractions in flight, 75 s timeout like `/check`, failed rows offer "Try again" or "Remove"; rows live in React state only. Aggregation, initials and CSV live in `src/lib/organizer.ts` (no amounts computed there).
- Why: Smallest set of choices that meets handoff 09 without touching shared pages; each keeps the worker path unchanged.
- Consequences / shortcuts: Finding titles are worded for a worker ("The numbers on your stub do not add up"); an organizer-specific title set would need new strings. The county list now exists in two places. The math-mismatch fixture stubs list rest pay or tray lines that do not add up to gross on purpose.

## D-054 — Organizer view kept and linked from the footer
- Date: 2026-10-24
- Decided by: Niki's team
- Status: Accepted
- Importance: Minor
- Decision: `/organizer` stays and is linked from the footer as "For organizers" / "Para organizadores". The noindex flag from handoff 09 is lifted.
- Why: Niki reviewed the hidden page and approved it.
- Consequences / shortcuts: Organizer-specific finding titles (D-053 open item) remain a polish task.

## D-055 — Organizer view promoted to a home page card
- Date: 2026-10-24
- Decided by: Niki's team with Fable 5.1
- Status: Accepted
- Importance: Minor
- Decision: A card on the home page after "What we check" ("Organizer or legal aid worker?") links to `/organizer`. The footer link stays. No header link, to keep the phone header to the logo and the language toggle.
- Why: Niki: nobody looks at footers. A home card is visible to judges and organizers without competing with the worker's main button.
- Consequences / shortcuts: None.

## D-056 — Organizer link lives in the header; home card removed (supersedes D-055)
- Date: 2026-10-24
- Decided by: Niki's team
- Status: Accepted
- Importance: Minor
- Decision: "Organizers" / "Organizadores" link in the site header between the logo and the language toggle, on all screen sizes. The home page card from D-055 is removed; the footer link stays.
- Why: Niki checked on her phone: the header link is visible and fits; the card was redundant.
- Consequences / shortcuts: Header is three items wide on phones; verified no overflow at 375 px.
