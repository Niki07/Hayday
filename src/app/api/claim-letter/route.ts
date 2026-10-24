// POST /api/claim-letter — { stub, answers, result, workerName? } -> { en, es } (handoff 03).
// Amounts come from `result` (the rules engine); the AI only writes the words around them (D-007).

import { z } from "zod";
import { LlmConfigError, writeClaimLetter, type ClaimLetterInput } from "@/lib/llm";

export const maxDuration = 60;

const bilingual = z.object({ en: z.string(), es: z.string() });
const money = z.number().finite().nonnegative();

const bodySchema = z.object({
  stub: z
    .object({ payType: z.enum(["hourly", "piece", "mixed", "unknown"]) })
    .passthrough(),
  answers: z.object({
    county: z.string(),
    dailyHours: z.array(z.number().finite().nonnegative()),
    gotRestBreaks: z.enum(["yes", "some", "no"]),
    gotMealBreaks: z.enum(["yes", "some", "no"]),
    paidByPiece: z.boolean(),
  }),
  result: z.object({
    findings: z.array(
      z.object({
        id: z.string(),
        amount: money,
        title: bilingual,
        explanation: bilingual,
        citation: z.string(),
        severity: z.enum(["high", "medium", "info"]),
      }),
    ),
    totalOwed: money,
    checkedRules: z.array(z.string()),
  }),
  workerName: z.string().max(200).optional(),
});

function error(status: number, code: string, message: string) {
  return Response.json({ error: code, message }, { status });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return error(400, "bad_request", "Body must be JSON: { stub, answers, result, workerName? }.");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return error(400, "bad_request", issues);
  }

  try {
    const letter = await writeClaimLetter(parsed.data as ClaimLetterInput);
    return Response.json(letter);
  } catch (err) {
    if (err instanceof LlmConfigError) {
      console.error(`[api/claim-letter] ${err.message}`);
      return error(500, "not_configured", `Server is missing ${err.variable}.`);
    }
    console.error(`[api/claim-letter] failed: ${(err as Error).message}`);
    return error(500, "letter_failed", "We could not write the letter. Please try again.");
  }
}
