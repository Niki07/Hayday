# PLAN.md — Hayday

Written by Fable 5.1 on 2026-10-24. Decisions behind this plan: D-004 to D-007 in `ENGINEERING.md`.

## The idea in two sentences
A farmworker photographs their pay stub. Hayday reads it, checks it against California farm labor pay rules, shows exactly what they may be owed and why, and prepares a bilingual wage complaint.

**Who it helps:** farmworkers in the Central Valley, mostly Spanish-speaking, on a phone, who suspect a short check but cannot tell why. Secondary: legal aid staff and organizers.

## Demo script (2 minutes, what the judges see)
1. Home page in English. One line on the problem: wage theft in farm work is common and almost never reported because the math is confusing and the forms are in English. Flip the toggle to Spanish and back to show it is bilingual.
2. Tap **Check my pay stub**. Show the two options, **Take a photo** and **Upload a file**. For the demo tap **Try a sample** and pick the piece-rate stub (or photograph the sample stub shown on the laptop screen with the phone, if the live extraction is reliable).
3. "Reading your pay stub..." then the fields appear. Point out that the AI read a crumpled photo and the worker can correct anything.
4. Answer the three questions: hours actually worked each day, rest breaks, meal breaks.
5. Result page: **"You may be owed $184.47"** with three cards: piece-rate rest breaks not paid, overtime after 8 hours missing, 2 hours not on the stub. Each card shows the rule, the citation and the dollars.
6. Tap **Prepare my claim**. The bilingual complaint letter appears, filled in. Tap download.
7. Close: "One photo. Money back. Nothing stored." Mention the organizer view if built.

## Stack and architecture (D-005, D-007)
- **Next.js 16.4.3 App Router, TypeScript, Tailwind, `src/` directory.** One repo, one Vercel deploy.
- **No database.** State for one check lives in React context backed by `sessionStorage`. Nothing persists after the tab closes.
- **Two API routes:**
  - `POST /api/extract` — image (base64) in, structured pay stub fields out. Calls the LLM vision model.
  - `POST /api/claim-letter` — findings in, bilingual letter text out. Calls the LLM.
- **One LLM wrapper:** `src/lib/llm.ts` (OpenAI SDK pointed at OpenRouter, model from `LLM_MODEL`, `DEMO_MODE` returns fixtures). Nothing else imports the SDK.
- **Rules engine:** `src/lib/rules/` pure TypeScript, unit tested with vitest. Input: extracted fields + worker answers + county. Output: list of findings with amount, rule name, plain explanation (en/es), citation.
- **i18n:** `src/lib/i18n.ts` dictionary with `en` and `es`, React context, English default (D-006).
- **Samples:** `src/lib/fixtures/samples.ts` holds 5 sample stubs (fields + expected findings). `/samples/[id]` renders each as a realistic on-screen pay stub so it can be photographed live or screenshotted to `public/samples/*.png`.

### Pages
| Route | Purpose |
|---|---|
| `/` | Home: one-line pitch, big **Check my pay stub** button, "what we check" in three lines, privacy promise, **Try a sample** link, small picture of a pay stub so users know what to photograph |
| `/check` | Two buttons: **Take a photo** (camera capture) and **Upload a file**. Sends to `/api/extract`, shows progress |
| `/check/review` | Extracted fields in an editable form + county dropdown + three questions (hours per day, rest breaks, meal breaks, paid by piece?) |
| `/check/result` | Headline amount, one card per finding (rule, plain words, citation, dollars), green state if nothing found, estimate disclaimer, **Prepare my claim** |
| `/check/claim` | Bilingual letter side by side, **Download PDF** (print stylesheet), checklist of next steps |
| `/help` | Free legal aid and farmworker organizations in the Central Valley by county (names + websites, verified, no invented phone numbers) |
| `/samples/[id]` | Renders a sample pay stub to look like a real one |

### Data shapes (shared types in `src/lib/types.ts`)
```ts
type PayStub = {
  employerName?: string; employeeName?: string;
  periodStart?: string; periodEnd?: string;          // ISO dates
  payType: "hourly" | "piece" | "mixed" | "unknown";
  hoursWorked?: number; hourlyRate?: number;
  overtimeHours?: number; overtimeRate?: number;
  pieceUnits?: number; pieceRate?: number; pieceUnitName?: string;
  restBreakPay?: number;                               // separately listed, if any
  grossPay?: number; netPay?: number;
  deductions?: { label: string; amount: number }[];
  rawText?: string; confidence?: number;              // 0..1 from the extractor
};
type WorkerAnswers = {
  county: string;
  dailyHours: number[];        // one entry per day worked in the period
  gotRestBreaks: "yes" | "some" | "no";
  gotMealBreaks: "yes" | "some" | "no";
  paidByPiece: boolean;
};
type Finding = {
  id: string;                  // e.g. "min-wage", "daily-ot", "piece-rest", "meal-premium", "stub-incomplete", "math-mismatch", "unpaid-hours"
  amount: number;              // dollars owed, 0 allowed for non-monetary violations
  title: { en: string; es: string };
  explanation: { en: string; es: string };
  citation: string;            // e.g. "Cal. Labor Code § 226.2"
  severity: "high" | "medium" | "info";
};
type CheckResult = { findings: Finding[]; totalOwed: number; checkedRules: string[] };
```

### Rules in scope (D-007)
| id | Rule in plain words | Where it comes from |
|---|---|---|
| `min-wage` | Hourly rate (or piece earnings ÷ hours) below the California minimum wage, or a higher local minimum where one applies | Cal. Labor Code § 1182.12; local ordinances table |
| `daily-ot` / `weekly-ot` | Farmworkers get 1.5x after 8 hours in a day or 40 in a week, 2x after 12 in a day | Cal. Labor Code § 857 et seq. (AB 1066), Wage Order 14 |
| `piece-rest` | Piece-rate workers must be paid separately for rest and recovery breaks, at least the average hourly rate or minimum wage, 10 minutes per 4 hours | Cal. Labor Code § 226.2 |
| `meal-premium` / `rest-premium` | Missed 30-minute meal (over 5 hours) or 10-minute rest break owes one extra hour of pay per day each | Cal. Labor Code § 512, § 226.7 |
| `stub-incomplete` | Stub missing required items (hours, rates, piece units, period dates, employer, gross, net, deductions) | Cal. Labor Code § 226(a) |
| `math-mismatch` | Stub's own numbers do not add up (hours × rate ≠ gross, etc.) | Evidence of error, no citation |
| `unpaid-hours` | Worker reports more hours than the stub shows | Cal. Labor Code § 1194 |

Rate values (minimum wage by year, local ordinances) go in `src/lib/rules/rates.ts` with effective dates and a source URL comment. **The subrunner verifies them against dir.ca.gov; nothing is assumed.**

## MVP (must work for the demo)
1. App shell: layout, nav, language toggle, design system, home page.
2. Rules engine with tests and 5 sample stubs with expected findings.
3. LLM wrapper, `/api/extract`, `/api/claim-letter`, DEMO_MODE fixtures.
4. Upload page (two buttons) and review page (fields + questions), wired to extract.
5. Result page and claim page with PDF download. Help page.
6. Sample stub renderer and PNGs. **Try a sample** path works with no network.
7. Deployed on Vercel with env vars set.

## Stretch goals (in order, only after the demo script runs clean)
1. **Organizer view** `/organizer`: drop in several sample stubs from one employer, see the pattern and the total. Reuses the rules engine. Biggest payoff for Innovation and Impact.
2. Voice input for the three questions (browser speech recognition).
3. Text-message delivery of the result (would need a Twilio decision from Fable).

## Task breakdown and schedule
Hour 0 is when building starts. Each task has a handoff doc in `handoffs/`.

| # | Task | Model | Depends on | Est. | Wave |
|---|---|---|---|---|---|
| 01 | App shell, i18n, design system, home page, help page | Sonnet | scaffold | 75 min | 1 |
| 02 | Rules engine + rates table + tests + 5 sample fixtures | Opus | scaffold | 90 min | 1 |
| 03 | LLM wrapper + `/api/extract` + `/api/claim-letter` + DEMO_MODE | Opus | scaffold | 75 min | 1 |
| 04 | Upload page + review page + session state | Sonnet | 01, 03 (types from 02) | 75 min | 2 |
| 05 | Result page + claim page + PDF print + wiring | Sonnet | 01, 02, 03 | 75 min | 2 |
| 06 | Sample stub renderer `/samples/[id]` + PNGs + Try a sample | Sonnet | 01, 02 | 45 min | 2 |
| 07 | Deploy to Vercel, env vars, smoke test on phone | Sonnet | 04, 05, 06 | 30 min | 3 |
| 08 | DEMO.md talk track + Canva slide outline + submission text | Fable | 07 | 30 min | 3 |
| 09 | Stretch: organizer view | Opus | 05, 06 | 60 min | stretch |

Timeline: wave 1 runs hours 0–1.5 (three sessions in parallel). Wave 2 runs hours 1.5–3. **Full demo path runs end to end by hour 3.5.** Hours 3.5–5.5 bug fixes and stretch 1. Hours 5.5–7 deploy, slides, DEMO.md, rehearsal. Hour 7–8 buffer. Submit 15 minutes before the deadline.

## Run it
```bash
npm run dev
```
Opens on http://localhost:3000. `DEMO_MODE=true` in `.env` makes every AI call return fixtures.

## Open questions (take to Fable)
- Submission format and deadline, not yet confirmed by organizers.
- Final product name. "Hayday" is a working name.
