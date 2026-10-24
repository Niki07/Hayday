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
5. `scripts/llm-test.ts` and `"llm:test": "tsx scripts/llm-test.ts"` (install `tsx` as a dev dependency) that runs extraction on `public/samples/sample-1.png` if present, else on a tiny generated PNG, and prints the parsed fields. Works in DEMO_MODE too.
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
- Status:
- What was built:
- What was NOT done and why:
- Decisions logged: D-___
- Open questions for Fable:
- How to verify:
