// The one LLM wrapper (SETUP.md, D-005). Nothing else in the app imports the `openai` package.
// The AI does two jobs only (D-007): read a pay stub image into fields, and write the claim letter.
// It never computes money: every amount in the letter comes from the rules engine via `input.result`.
// Server-side only. Keys are read from env and never logged.

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { z } from "zod";
import type { PayStub } from "@/lib/types";
import { samples } from "@/lib/fixtures/samples";
import { buildTemplateLetter, formatUsd, type ClaimLetter, type ClaimLetterInput } from "@/lib/fixtures/letters";

export type { ClaimLetter, ClaimLetterInput } from "@/lib/fixtures/letters";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEMO_EXTRACT_DELAY_MS = 1500;
const DEMO_LETTER_DELAY_MS = 800;

/** Thrown when a required env variable is missing. The message names the variable, never a value. */
export class LlmConfigError extends Error {
  constructor(public variable: string) {
    super(
      `Missing environment variable ${variable}. Set it in .env at the project root (see .env.example), or set DEMO_MODE=true to use canned responses.`,
    );
    this.name = "LlmConfigError";
  }
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

let cached: { client: OpenAI; model: string; key: string } | null = null;

function getClient(): { client: OpenAI; model: string } {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) throw new LlmConfigError("OPENROUTER_API_KEY");
  const model = process.env.LLM_MODEL?.trim();
  if (!model) throw new LlmConfigError("LLM_MODEL");
  if (!cached || cached.key !== key || cached.model !== model) {
    cached = {
      key,
      model,
      client: new OpenAI({
        apiKey: key,
        baseURL: OPENROUTER_BASE_URL,
        timeout: 60_000,
        maxRetries: 1,
        defaultHeaders: { "HTTP-Referer": "https://hayday.local", "X-Title": "Hayday" },
      }),
    };
  }
  return { client: cached.client, model: cached.model };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Pay stub extraction
// ---------------------------------------------------------------------------

const EXTRACT_SYSTEM_PROMPT = `You read photos of US (mostly California farm work) pay stubs and transcribe them into JSON.

Return ONLY one JSON object. No prose, no markdown, no code fences.

Schema (every key except payType may be null):
{
  "employerName": string | null,      // company that paid the worker
  "employeeName": string | null,      // worker's name as printed
  "periodStart": "YYYY-MM-DD" | null, // first day of the pay period
  "periodEnd": "YYYY-MM-DD" | null,   // last day of the pay period
  "payType": "hourly" | "piece" | "mixed" | "unknown",
  "hoursWorked": number | null,       // total hours worked in the period, as printed
  "hourlyRate": number | null,        // regular hourly rate in dollars
  "overtimeHours": number | null,     // hours paid at an overtime rate
  "overtimeRate": number | null,      // overtime hourly rate in dollars
  "pieceUnits": number | null,        // count of pieces (trays, bins, buckets, boxes...)
  "pieceRate": number | null,         // dollars paid per piece
  "pieceUnitName": string | null,     // singular English unit name, e.g. "tray", "bin", "bucket"
  "restBreakPay": number | null,      // ONLY a separate line paying for rest/recovery breaks; otherwise null
  "grossPay": number | null,          // total earnings before deductions
  "netPay": number | null,            // take-home pay after deductions
  "deductions": [{ "label": string, "amount": number }] | null, // each withholding/deduction line
  "rawText": string,                  // every readable line of the stub, top to bottom, separated by \\n
  "confidence": number                // 0 to 1, how sure you are of the fields above
}

Rules:
- Copy values exactly as printed. Never calculate, estimate or fill in a value that is not printed on the stub
  (for example, do not compute gross pay from hours x rate, and do not compute net pay). A missing value is null.
- Numbers are plain JSON numbers: no "$", no commas, no units. Deduction amounts are positive numbers.
- Dates must be ISO "YYYY-MM-DD". Convert printed dates like 09/07/2026 (US month/day order). If only one date is
  printed, use it for periodEnd and leave periodStart null.
- payType: "piece" if pay is per unit only, "hourly" if per hour only, "mixed" if both appear, "unknown" if unclear.
- Labels may be in Spanish (e.g. "Horas" = hours, "Pago bruto" = gross pay, "Pago neto" = net pay,
  "Deducciones" = deductions, "Cajas"/"Charolas" = trays). Write field values as printed.
- confidence: about 0.9 for a sharp, complete stub; lower it for blur, glare, cut-off edges or guessed digits.
- If the image is not a pay stub or is unreadable, return payType "unknown", confidence 0, all other fields null,
  and put whatever text you can read in rawText.`;

/** "$1,234.50" -> 1234.5; null/"" -> undefined; anything else passes through for zod to judge. */
function toNumber(v: unknown): unknown {
  if (v === null || v === undefined || v === "") return undefined;
  if (typeof v === "string") {
    const n = Number(v.replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : v;
  }
  return v;
}

const lenientNumber = z.preprocess(toNumber, z.number().finite().nonnegative().optional());

const lenientString = z.preprocess((v) => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") return v.trim() || undefined;
  return v;
}, z.string().optional());

/** Accepts ISO dates, converts MM/DD/YYYY, rejects anything else so the retry can fix it. */
const isoDate = z.preprocess(
  (v) => {
    if (v === null || v === undefined || v === "") return undefined;
    if (typeof v === "string") {
      const us = v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
      return v.trim();
    }
    return v;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date YYYY-MM-DD")
    .optional(),
);

const payStubSchema = z.object({
  employerName: lenientString,
  employeeName: lenientString,
  periodStart: isoDate,
  periodEnd: isoDate,
  payType: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.enum(["hourly", "piece", "mixed", "unknown"]),
  ),
  hoursWorked: lenientNumber,
  hourlyRate: lenientNumber,
  overtimeHours: lenientNumber,
  overtimeRate: lenientNumber,
  pieceUnits: lenientNumber,
  pieceRate: lenientNumber,
  pieceUnitName: lenientString,
  restBreakPay: lenientNumber,
  grossPay: lenientNumber,
  netPay: lenientNumber,
  deductions: z.preprocess(
    (v) => (v === null ? undefined : v),
    z
      .array(
        z.object({
          label: z.string().trim().min(1),
          amount: z.preprocess((v) => {
            const n = toNumber(v);
            return typeof n === "number" ? Math.abs(n) : n;
          }, z.number().finite()),
        }),
      )
      .optional(),
  ),
  rawText: lenientString,
  confidence: z.preprocess(
    (v) => (typeof v === "number" ? Math.min(1, Math.max(0, v)) : v),
    z.number().min(0).max(1),
  ),
});

/** Pulls the JSON object out of a model reply, tolerating code fences or stray prose. */
function extractJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object found in the reply");
  return JSON.parse(text.slice(start, end + 1));
}

function parsePayStub(text: string): { ok: true; stub: PayStub } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = extractJsonObject(text);
  } catch (err) {
    return { ok: false, error: `invalid JSON (${(err as Error).message})` };
  }
  const result = payStubSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 8)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    return { ok: false, error: issues };
  }
  // Drop undefined keys so the object matches the optional-field shape exactly.
  const stub = Object.fromEntries(Object.entries(result.data).filter(([, v]) => v !== undefined)) as PayStub;
  return { ok: true, stub };
}

/** Best effort to keep the transcription when the JSON itself is unusable. */
function salvageRawText(text: string): string {
  try {
    const data = extractJsonObject(text) as { rawText?: unknown };
    if (typeof data.rawText === "string") return data.rawText;
  } catch {
    // fall through
  }
  const m = text.match(/"rawText"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (m) {
    try {
      return JSON.parse(`"${m[1]}"`);
    } catch {
      return m[1];
    }
  }
  return text.slice(0, 4000);
}

function replyText(completion: OpenAI.Chat.Completions.ChatCompletion): { text: string; truncated: boolean } {
  const choice = completion.choices[0];
  return { text: choice?.message?.content ?? "", truncated: choice?.finish_reason === "length" };
}

/**
 * Reads a pay stub image into a PayStub. One retry with the validation error fed back; if that also fails,
 * returns `{ payType: "unknown", confidence: 0, rawText }` so the review page can ask the worker to type values.
 * Network/API errors and missing config throw.
 */
export async function extractPayStub(imageBase64: string, mimeType: string): Promise<PayStub> {
  if (isDemoMode()) {
    await sleep(DEMO_EXTRACT_DELAY_MS);
    return structuredClone(samples[0].stub);
  }
  const { client, model } = getClient();

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: EXTRACT_SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        { type: "text", text: "Transcribe this pay stub into the JSON object described. JSON only." },
      ],
    },
  ];

  let last = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const completion = await client.chat.completions.create({ model, messages, temperature: 0, max_tokens: 4000 });
    const { text, truncated } = replyText(completion);
    last = text;
    const parsed = parsePayStub(text);
    if (parsed.ok) return parsed.stub;

    const problem = truncated ? "the reply was cut off; keep rawText shorter" : parsed.error;
    console.warn(`[llm] extractPayStub attempt ${attempt} failed validation: ${problem}`);
    messages.push(
      { role: "assistant", content: text || "(empty reply)" },
      {
        role: "user",
        content: `That reply did not match the schema. Problem: ${problem}. Reply again with only the corrected JSON object.`,
      },
    );
  }
  return { payType: "unknown", confidence: 0, rawText: salvageRawText(last) };
}

// ---------------------------------------------------------------------------
// Claim letter
// ---------------------------------------------------------------------------

const LETTER_SYSTEM_PROMPT = `You write wage claim letters for California farmworkers.

You receive a JSON object of facts. Write one letter from the worker to the employer, in English and in Spanish.
The letter must be formal but plain (short sentences, no legal jargon beyond the citations given), suitable to send
to the employer and to attach to a wage claim with the California Labor Commissioner's Office.

Content, in this order:
1. The date given in "today", then the employer's name (or "[Employer name]" / "[Nombre del empleador]" if null).
2. A subject line about a request for payment of unpaid wages.
3. One or two sentences saying the worker worked for the employer during the pay period given, and reviewed the
   pay stub against California wage law.
4. A numbered list with every finding, in the order given: its title, its citation, its amount (if not null), and a
   one-sentence plain explanation based only on the explanation given.
5. The total owed, exactly as given in "totalOwed".
6. A polite, firm request that the employer pay the total and correct future pay stubs.
7. A closing with the worker's name (or "[Your name]" / "[Su nombre]" if null).

Strict rules:
- Use only the facts in the input. Do not invent dates, deadlines, addresses, phone numbers, hours or events.
- Do not say a wage claim has been filed. Say this letter may be submitted with a wage claim.
- Every dollar amount you write must be copied exactly from the input. Never add, round, convert or compute amounts.
- The Spanish letter says the same thing as the English one, in natural Spanish (not a word-for-word translation).
- Plain text only: no markdown, no asterisks, no headings with #.

Return ONLY this JSON object, no code fences: { "en": "<English letter>", "es": "<Spanish letter>" }`;

const letterSchema = z.object({
  en: z.string().trim().min(200, "letter is too short"),
  es: z.string().trim().min(200, "letter is too short"),
});

const DOLLAR_RE = /\$\s?\d[\d,]*(?:\.\d+)?/g;

function cents(dollarText: string): number {
  return Math.round(Number(dollarText.replace(/[$,\s]/g, "")) * 100);
}

/** Every amount the letter may mention: finding amounts, the total, and any $ figure already in the explanations. */
function allowedCents(input: ClaimLetterInput): Set<number> {
  const allowed = new Set<number>([Math.round(input.result.totalOwed * 100)]);
  for (const f of input.result.findings) {
    allowed.add(Math.round(f.amount * 100));
    for (const text of [f.explanation.en, f.explanation.es, f.title.en, f.title.es]) {
      for (const m of text.match(DOLLAR_RE) ?? []) allowed.add(cents(m));
    }
  }
  return allowed;
}

/** D-007 guard: the total and every finding amount must appear, and no other dollar figure may. */
function checkLetterAmounts(letter: ClaimLetter, input: ClaimLetterInput): string | null {
  const allowed = allowedCents(input);
  const required = [input.result.totalOwed, ...input.result.findings.map((f) => f.amount)].filter((a) => a > 0);
  for (const [lang, text] of Object.entries(letter)) {
    const found = new Set((text.match(DOLLAR_RE) ?? []).map(cents));
    for (const c of found) {
      if (!allowed.has(c)) return `the ${lang} letter contains $${(c / 100).toFixed(2)}, which is not in the input`;
    }
    for (const amount of required) {
      if (!found.has(Math.round(amount * 100))) return `the ${lang} letter is missing ${formatUsd(amount)}`;
    }
  }
  return null;
}

function letterFacts(input: ClaimLetterInput) {
  const { stub, result } = input;
  return {
    today: new Date().toISOString().slice(0, 10),
    employerName: stub.employerName ?? null,
    workerName: input.workerName?.trim() || stub.employeeName || null,
    payPeriod: { start: stub.periodStart ?? null, end: stub.periodEnd ?? null },
    county: input.answers.county || null,
    findings: result.findings.map((f) => ({
      title: f.title,
      citation: f.citation,
      amount: f.amount > 0 ? formatUsd(f.amount) : null,
      explanation: f.explanation,
    })),
    totalOwed: formatUsd(result.totalOwed),
  };
}

/**
 * Writes the bilingual claim letter from rules-engine findings. One retry with the problem fed back; after that,
 * or on an API error, returns the deterministic template letter so the claim page always has a correct letter.
 * Missing config throws.
 */
export async function writeClaimLetter(input: ClaimLetterInput): Promise<ClaimLetter> {
  if (isDemoMode()) {
    await sleep(DEMO_LETTER_DELAY_MS);
    return buildTemplateLetter(input);
  }
  const { client, model } = getClient();

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: LETTER_SYSTEM_PROMPT },
    { role: "user", content: JSON.stringify(letterFacts(input), null, 2) },
  ];

  try {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const completion = await client.chat.completions.create({ model, messages, temperature: 0.2, max_tokens: 4000 });
      const { text, truncated } = replyText(completion);

      let problem: string | null = truncated ? "the reply was cut off" : null;
      if (!problem) {
        try {
          const parsed = letterSchema.safeParse(extractJsonObject(text));
          if (!parsed.success) problem = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
          else problem = checkLetterAmounts(parsed.data, input) ?? null;
          if (!problem && parsed.success) return parsed.data;
        } catch (err) {
          problem = `invalid JSON (${(err as Error).message})`;
        }
      }

      console.warn(`[llm] writeClaimLetter attempt ${attempt} rejected: ${problem}`);
      messages.push(
        { role: "assistant", content: text || "(empty reply)" },
        {
          role: "user",
          content: `That reply was rejected. Problem: ${problem}. Reply again with only the corrected JSON object.`,
        },
      );
    }
  } catch (err) {
    if (err instanceof LlmConfigError) throw err;
    console.warn(`[llm] writeClaimLetter API call failed, using template letter: ${(err as Error).message}`);
  }
  return buildTemplateLetter(input);
}
