# Handoff 03 — LLM wrapper, extract and claim-letter API routes, DEMO_MODE

- Model: Opus
- Depends on: scaffold (already done). Uses the types from handoff 02 (`src/lib/types.ts`); if that file does not exist yet when you start, create it with the exact types from PLAN.md and tell 02's subrunner in your report.
- Can run in parallel with: 01, 02
- Estimated time: 75 min

## Goal
Two working API routes: one turns a pay stub image into structured fields using an AI vision model, the other turns findings into a bilingual complaint letter. Both work with `DEMO_MODE=true` and no network.

## Context
The AI does exactly two jobs (D-007). Extraction quality on bad photos is the hardest technical piece in the project. See SETUP.md "LLM / API wiring" for the wrapper rule and env names.

## Read first
- CLAUDE.md, ENGINEERING.md (D-005, D-007), SETUP.md (LLM section, env names)
- PLAN.md: "Data shapes", "Stack and architecture"
- `.env.example`

## Deliverable
1. `src/lib/llm.ts`: single wrapper using the `openai` package pointed at OpenRouter (`baseURL: "https://openrouter.ai/api/v1"`, key `OPENROUTER_API_KEY`, model from `LLM_MODEL`). Exports:
   - `extractPayStub(imageBase64: string, mimeType: string): Promise<PayStub>` — sends the image with a precise system prompt asking for JSON matching `PayStub`, including `rawText` and a `confidence` 0–1. Validate the response with `zod`; on parse failure retry once with the error fed back; on second failure return `{ payType: "unknown", confidence: 0, rawText }`.
   - `writeClaimLetter(input: { stub: PayStub; answers: WorkerAnswers; result: CheckResult; workerName?: string }): Promise<{ en: string; es: string }>` — formal but plain letter addressed to the employer and suitable as an attachment to a California Labor Commissioner wage claim, listing each finding with amount and citation, total owed, and a request for payment. Both languages. No invented facts beyond the input.
   - If `DEMO_MODE === "true"`: `extractPayStub` returns `samples[0].stub` from `src/lib/fixtures/samples.ts` (or a local copy if 02 is not done yet) after a 1.5s delay; `writeClaimLetter` returns a fixture letter from `src/lib/fixtures/letters.ts`.
   - Throws a clear error naming the variable if `OPENROUTER_API_KEY` or `LLM_MODEL` is missing and `DEMO_MODE` is not true. Never logs the key.
2. **Pick and verify the model slug.** Fetch `https://openrouter.ai/api/v1/models` (public, no key) and choose a current Anthropic Claude model that supports image input. Put the exact slug as the `LLM_MODEL` value in `.env.example` and in ENGINEERING.md. Do not guess the slug.
3. `src/app/api/extract/route.ts`: `POST` with JSON `{ image: string (base64, no data: prefix), mimeType: string }`. Limit 8 MB. Returns `PayStub`. Returns 400 on bad input, 500 with a safe message on failure.
4. `src/app/api/claim-letter/route.ts`: `POST` with the `writeClaimLetter` input, returns `{ en, es }`.
5. `scripts/llm-test.ts` and `"llm:test": "tsx scripts/llm-test.ts"` that runs extraction on `public/samples/sample-1.png` if present, else on a tiny generated PNG, and prints the parsed fields. Works in DEMO_MODE too.
6. `.env.example` updated. If Niki has provided a real key in `.env`, run `npm run llm:test` once against the real model and record the result in your report; if not, run it in DEMO_MODE and say so.

## Done when
- [ ] `DEMO_MODE=true npm run llm:test` prints sample fields with no network
- [ ] `curl -X POST localhost:3000/api/extract` with a sample image body returns valid `PayStub` JSON (DEMO_MODE or real)
- [ ] `curl -X POST localhost:3000/api/claim-letter` with sample input returns `{ en, es }`
- [ ] Missing key without DEMO_MODE produces a clear error naming the variable; the key never appears in any log
- [ ] Model slug verified from the live models list and recorded in `.env.example` and ENGINEERING.md
- [ ] Decisions logged in ENGINEERING.md (slug, prompt design, retry policy, size limit)
- [ ] Report back section below is filled in

## Constraints
- Do not edit package.json or install packages (D-009). Needed dependency → Open item in your report.
- Only `src/lib/llm.ts` imports the `openai` package.
- Server-side only. Never expose the key to the client.
- Do not touch `src/app/(pages)`, `src/lib/rules/` or `src/lib/i18n.ts`.

## Out of scope
- UI for upload (04)
- PDF generation (05)
- Any storage of images

## Decisions already made (do not reopen)
- D-005: OpenRouter via OpenAI SDK, one wrapper file
- D-007: AI extracts and writes; it never computes amounts

## Decisions you may hit (escalate to Fable 5.1)
- If no suitable vision model is available on OpenRouter, log Open and fall back to the Anthropic SDK directly with `ANTHROPIC_API_KEY` and model `claude-sonnet-5-5`; record it
- Whether to downscale images client-side (recommend yes in 04; note it in your report)

## Report back (filled in by the subrunner)
- Status: Done, tested live against OpenRouter. Nothing committed (per instructions).
- What was built:
  - `src/lib/llm.ts`: the only `openai` import. `extractPayStub(imageBase64, mimeType)` and `writeClaimLetter(input)`, plus `isDemoMode()`, `LlmConfigError` and the types `ClaimLetterInput`/`ClaimLetter`. Zod validation, one retry with the error fed back, safe fallbacks (D-018, D-019). The letter is checked so that the total and every finding amount appear in both languages and no other dollar figure does (enforces D-007).
  - `src/lib/fixtures/letters.ts`: `buildTemplateLetter(input)` (DEMO_MODE letter and fallback) and `formatUsd`. `src/lib/fixtures/demo-stub.ts`: DEMO_MODE extraction stub (D-021).
  - `src/app/api/extract/route.ts`: `POST { image, mimeType }` → `PayStub`. Returns 400 for bad JSON, bad base64 or a wrong mime type; 413 over 8 MB; 500 `{ error, message }` with a safe message (D-020).
  - `src/app/api/claim-letter/route.ts`: `POST { stub, answers, result, workerName? }` → `{ en, es }`, input checked with zod (400 on bad shape).
  - `scripts/llm-test.ts`: `npm run llm:test [-- <image>] [-- --letter]`. Loads `.env`, but variables already set in the shell win. Uses `public/samples/sample-1.png` if present, else a generated 16×16 PNG.
  - `LLM_MODEL=anthropic/claude-sonnet-5.5` written to `.env.example` and to the `LLM_MODEL=` line of `.env` (key line not touched) (D-017).
  - `src/lib/types.ts` already existed (written by 02); not touched.
- Results:
  - `DEMO_MODE=true npm run llm:test -- --letter`: demo stub after 1.5 s and the template letter, no network.
  - Live, on a generated 900×614 test stub (piece rate, 412 trays × $1.10, four deductions): every field correct, confidence 0.95, about 7 s. Live letter: correct in both languages, all amounts passed the check, about 10 s. A blank 16×16 PNG returns `{ payType: "unknown", confidence: 0 }`.
  - Through the running dev server on :3000 (live mode): `/api/extract` returned the same correct `PayStub` (200, about 15 s). `/api/claim-letter` returned `{ en, es }` (200, about 8 s). Bad JSON, a HEIC mime type and bad base64 return 400; an 11.5 MB body returns 413; a bad letter body returns 400 with the failing fields.
  - With `OPENROUTER_API_KEY=` or `LLM_MODEL=` empty and `DEMO_MODE=false`, the call fails with "Missing environment variable OPENROUTER_API_KEY …" (or `LLM_MODEL`). The key's value appears in no output, source or log file (checked with grep).
- What was NOT done and why:
  - The routes were not curled in DEMO_MODE. The only dev server belongs to another session and runs with `DEMO_MODE=false`; a second `next dev` in the same folder would clash. The demo path inside the wrapper is tested by the script.
  - DEMO_MODE extraction returns a local copy, not `samples[0].stub`, because `src/lib/fixtures/samples.ts` had not landed. Follow-up: once it lands, import `samples` in `llm.ts`, return `structuredClone(samples[0].stub)` and delete `demo-stub.ts` (D-021).
  - `.env.example` is git-ignored: line 42 of `.gitignore` (`.env*`, from the Next.js scaffold) overrides the earlier `!.env.example`. It needs `!.env.example` added after line 42, or the file will never be committed. I left `.gitignore` alone because it is outside this handoff.
- Decisions logged: D-017 (model slug), D-018 (extraction prompt), D-019 (retry and fallback), D-020 (size and type limits), D-021 (DEMO_MODE fixtures), D-022 (Open).
- Open questions for Fable:
  - D-022: should 04 downscale photos in the browser (long edge about 1600 px, JPEG about 0.85)? Recommended yes. Without it, phone photos over about 3.3 MB fail on Vercel (4.5 MB body limit) and over 5 MB fail at Anthropic. It also converts HEIC to JPEG.
- Notes for 04 and 05:
  - `/api/extract` errors have the shape `{ error: "bad_request" | "too_large" | "not_configured" | "extract_failed", message }`. On `payType: "unknown"` with `confidence: 0`, send the worker to manual entry on the review page.
  - Live extraction takes 7–15 s, so show a progress state.
  - `/api/claim-letter` never fails for AI reasons; it falls back to the template letter. It only returns 400 on a bad body or 500 on missing config.
- How to verify:
  - `DEMO_MODE=true npm run llm:test -- --letter` (no network)
  - `npm run llm:test -- path/to/stub.png --letter` (live, costs a few cents)
  - `curl -X POST localhost:3000/api/extract -H 'content-type: application/json' -d "{\"image\":\"$(base64 -i path/to/stub.png)\",\"mimeType\":\"image/png\"}"`
