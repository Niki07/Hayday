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
