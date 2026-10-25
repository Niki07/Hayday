<p align="center"><img src="design/logo/hayday-logo-tile-1024.png" width="120" alt="Hayday logo"></p>

<h1 align="center">Hayday</h1>
<p align="center"><strong>Make every payday a Hayday.</strong><br>
A free, bilingual web app that helps Central Valley farmworkers find out if they were underpaid.</p>

<p align="center"><a href="https://hayday-sigma.vercel.app">hayday-sigma.vercel.app</a></p>

---

Winner, Central Valley hackathon, October 24, 2026. Built in eight hours by a team of two.

## What it does

1. **Photograph your pay stub.** An AI model reads the picture into numbers: hours, rate, pieces, gross, deductions, net. You check them and fix anything wrong. No stub? Enter what you know; not receiving one is itself a violation.
2. **Answer three questions** about your week: county, days and hours worked, breaks.
3. **See what you may be owed.** A rules engine written in plain code, not AI, checks everything against California farm labor pay law: minimum wage, daily and weekly overtime, paid rest breaks for piece-rate work, meal and rest break penalties, unpaid hours, and missing stub information. Every finding shows the math and links to the actual Labor Code section.
4. **Get the letter.** The AI drafts a wage demand letter in English and Spanish from the verified numbers, ready to attach to a claim with the California Labor Commissioner. Free legal aid offices for your county are shown on the result.

A **supervisor view** lets a crew leader or legal aid worker load many stubs from one employer and see the pattern: which rule is broken, on how many stubs, with the law cited on every line and a CSV export.

Nothing is stored. No accounts, no database, no tracking.

## How it works

| Step | What runs | Where |
|---|---|---|
| Read | Claude via the OpenRouter API, transcribe-only prompt, Zod-validated, one retry | `src/lib/llm.ts`, `src/app/api/extract` |
| Check | Nine deterministic rules in TypeScript, rate table verified against the CA Department of Industrial Relations, 60 tests | `src/lib/rules/` |
| Write | Claude drafts the bilingual letter from the verified `CheckResult` only; output checked for stray dollar figures | `src/lib/llm.ts`, `src/app/api/claim-letter` |

Results are estimates, err on the low side, and are not legal advice. See `/terms` and `/rules` on the site.

## Run it locally

```bash
npm install
cp .env.example .env   # add your OPENROUTER_API_KEY, or set DEMO_MODE=true
npm run dev            # http://localhost:3000
npm test               # rules engine tests
```

`DEMO_MODE=true` runs the whole app with sample data and no API calls. The sample flow is at `/check?sample=1`.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind, Vitest, Vercel. One server-side API key. State lives in the browser tab.

## Project docs

- `PLAN.md` — demo script, architecture, data shapes, rules in scope
- `ENGINEERING.md` — the decision log, 59 entries
- `PITCH.md`, `DEMO.md` — pitch text and demo scripts
- `handoffs/` — the task contracts used to build it with parallel AI sessions

## What's next

Legal aid review of the rules and wording, voice input, text-message results, Mixtec audio, and a pilot with a Central Valley legal aid office.
