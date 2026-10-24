// npm run llm:test [-- <image path>] [-- --letter]
// Runs pay stub extraction once and prints the parsed fields. Uses `public/samples/sample-1.png` if present,
// else a tiny generated PNG. `--letter` also writes a claim letter from test findings.
// Reads .env from the project root; variables already set in the shell win (so `DEMO_MODE=true npm run llm:test` works).
// Never prints keys.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { crc32, deflateSync } from "node:zlib";

const root = path.resolve(__dirname, "..");
try {
  process.loadEnvFile(path.join(root, ".env"));
} catch {
  // no .env: rely on the shell environment
}

/** Minimal valid PNG: a light gray square, so the test runs without any sample files. */
function tinyPng(size = 16): Buffer {
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // grayscale
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(size, 0xe0)]);
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function mimeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

async function main() {
  // Import after loading .env so the wrapper sees the variables.
  const { extractPayStub, writeClaimLetter, isDemoMode } = await import("../src/lib/llm");

  const args = process.argv.slice(2);
  const wantLetter = args.includes("--letter");
  const imageArg = args.find((a) => !a.startsWith("--"));
  const sample = path.join(root, "public/samples/sample-1.png");

  let image: Buffer;
  let mimeType: string;
  let source: string;
  if (imageArg) {
    image = readFileSync(path.resolve(imageArg));
    mimeType = mimeFor(imageArg);
    source = imageArg;
  } else if (existsSync(sample)) {
    image = readFileSync(sample);
    mimeType = "image/png";
    source = "public/samples/sample-1.png";
  } else {
    image = tinyPng();
    mimeType = "image/png";
    source = "generated 16x16 PNG (no sample file found)";
  }

  console.log(`DEMO_MODE: ${isDemoMode() ? "true (fixtures, no network)" : "false (live)"}`);
  if (!isDemoMode()) console.log(`LLM_MODEL: ${process.env.LLM_MODEL || "(not set)"}`);
  console.log(`Image: ${source}, ${mimeType}, ${(image.length / 1024).toFixed(1)} KB`);

  const t0 = Date.now();
  const stub = await extractPayStub(image.toString("base64"), mimeType);
  console.log(`\nextractPayStub (${Date.now() - t0} ms):`);
  console.log(JSON.stringify(stub, null, 2));

  if (wantLetter) {
    // Test input only. In the app these findings come from the rules engine (src/lib/rules), never from the AI.
    const t1 = Date.now();
    const letter = await writeClaimLetter({
      stub: stub.payType === "unknown" ? { ...stub, employerName: "Sunfield Vineyards LLC" } : stub,
      answers: { county: "Fresno", dailyHours: [10, 10, 10, 10, 10], gotRestBreaks: "no", gotMealBreaks: "yes", paidByPiece: true },
      result: {
        findings: [
          {
            id: "piece-rest",
            amount: 36.8,
            title: { en: "Rest breaks not paid separately", es: "Descansos no pagados por separado" },
            explanation: {
              en: "Piece-rate workers must be paid for rest breaks separately. 4 hours of breaks x $9.20 = $36.80.",
              es: "A quienes trabajan por pieza se les deben pagar los descansos aparte. 4 horas x $9.20 = $36.80.",
            },
            citation: "Cal. Labor Code § 226.2",
            severity: "high",
          },
          {
            id: "daily-ot",
            amount: 91.2,
            title: { en: "Daily overtime not paid", es: "Horas extra diarias no pagadas" },
            explanation: {
              en: "You worked 10 hours a day. 2 hours a day over 8 x 5 days = 10 hours x $9.12 half-time premium = $91.20.",
              es: "Trabajó 10 horas al día. 2 horas extra x 5 días = 10 horas x $9.12 de prima = $91.20.",
            },
            citation: "Cal. Labor Code § 860",
            severity: "high",
          },
          {
            id: "unpaid-hours",
            amount: 56.5,
            title: { en: "Hours missing from the pay stub", es: "Horas que faltan en el talón" },
            explanation: {
              en: "You report 50 hours; the stub shows 48. 2 hours x $28.25 = $56.50.",
              es: "Usted reporta 50 horas; el talón muestra 48. 2 horas x $28.25 = $56.50.",
            },
            citation: "Cal. Labor Code § 1194",
            severity: "medium",
          },
        ],
        totalOwed: 184.5,
        checkedRules: ["min-wage", "daily-ot", "weekly-ot", "piece-rest", "unpaid-hours"],
      },
    });
    console.log(`\nwriteClaimLetter (${Date.now() - t1} ms):`);
    console.log(`--- en ---\n${letter.en}\n--- es ---\n${letter.es}`);
  }
}

main().catch((err: Error) => {
  console.error(`\nllm:test failed: ${err.message}`);
  process.exit(1);
});
