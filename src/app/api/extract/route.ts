// POST /api/extract — { image: base64 (no data: prefix), mimeType } -> PayStub (handoff 03).
// Images are read in memory and never stored.

import { z } from "zod";
import { extractPayStub, LlmConfigError } from "@/lib/llm";

export const maxDuration = 60;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// base64 is 4/3 the size of the bytes, plus a little JSON around it.
const MAX_BODY_BYTES = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 64 * 1024;
const MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const bodySchema = z.object({
  image: z.string().min(1, "image is required"),
  mimeType: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase().replace("image/jpg", "image/jpeg") : v),
    z.enum(MIME_TYPES, { message: `mimeType must be one of ${MIME_TYPES.join(", ")}` }),
  ),
});

function error(status: number, code: string, message: string) {
  return Response.json({ error: code, message }, { status });
}

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return error(413, "too_large", "Image is larger than 8 MB.");

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return error(400, "bad_request", "Body must be JSON: { image, mimeType }.");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return error(400, "bad_request", parsed.error.issues.map((i) => i.message).join("; "));
  }

  // Tolerate a data URL even though the contract says plain base64.
  const image = parsed.data.image.replace(/^data:[^;,]+;base64,/, "").replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(image)) {
    return error(400, "bad_request", "image must be base64-encoded.");
  }
  const bytes = Math.floor((image.length * 3) / 4) - (image.match(/=+$/)?.[0].length ?? 0);
  if (bytes > MAX_IMAGE_BYTES) return error(413, "too_large", "Image is larger than 8 MB.");

  try {
    const stub = await extractPayStub(image, parsed.data.mimeType);
    return Response.json(stub);
  } catch (err) {
    if (err instanceof LlmConfigError) {
      console.error(`[api/extract] ${err.message}`);
      return error(500, "not_configured", `Server is missing ${err.variable}.`);
    }
    console.error(`[api/extract] extraction failed: ${(err as Error).message}`);
    return error(500, "extract_failed", "We could not read this photo. Please try again or enter the numbers by hand.");
  }
}
