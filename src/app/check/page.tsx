"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SampleSheet from "@/components/check/SampleSheet";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import { useCheck } from "@/lib/check-state";
import { getSample, type Sample } from "@/lib/fixtures/samples";
import { prepareFile, type PreparedFile } from "@/lib/image";
import { useT, type TKey } from "@/lib/i18n";
import type { PayStub } from "@/lib/types";

// Live extraction takes 7–15 s; give up after this long.
const REQUEST_TIMEOUT_MS = 75_000;

type Phase = "idle" | "reading" | "error";

function ReadingBar() {
  return (
    <svg className="h-2 w-full overflow-hidden rounded-full" aria-hidden="true">
      <rect width="100%" height="100%" className="fill-accent-soft" />
      <rect y="0" width="35%" height="100%" rx="4" className="fill-accent">
        <animate attributeName="x" values="-35%;100%" dur="1.6s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

function UploadScreen() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { start } = useCheck();

  const sampleParam = params.get("sample");
  const [sheetOpen, setSheetOpen] = useState(sampleParam !== null);
  const highlightId = sampleParam ? getSample(sampleParam)?.id : undefined;

  const [phase, setPhase] = useState<Phase>("idle");
  const [errorKey, setErrorKey] = useState<TKey>("check.error.generic");
  const [thumb, setThumb] = useState<string>();

  const photoInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const prepared = useRef<PreparedFile | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      const pending = controller.current;
      controller.current = null; // tells send() the page was left
      pending?.abort();
    },
    [],
  );

  function fail(key: TKey) {
    setErrorKey(key);
    setPhase("error");
  }

  async function send(file: PreparedFile) {
    setPhase("reading");
    const ctrl = new AbortController();
    controller.current = ctrl;
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: file.base64, mimeType: file.mimeType }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        if (body?.error === "too_large") return fail("check.error.size");
        if (body?.error === "bad_request") return fail("check.error.type");
        return fail("check.error.generic");
      }
      const stub = (await res.json()) as PayStub;
      if (!stub || typeof stub.payType !== "string") return fail("check.error.generic");
      // payType "unknown" with confidence 0 means nothing was read; the review page then asks for manual entry.
      start({ stub, imagePreview: file.thumbnail });
      router.push("/check/review");
    } catch (err) {
      if (controller.current !== ctrl) return; // page left
      fail(err instanceof TypeError ? "check.error.network" : "check.error.generic");
    } finally {
      clearTimeout(timer);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again
    if (!file) return;
    setPhase("reading");
    setThumb(undefined);
    try {
      prepared.current = await prepareFile(file);
    } catch {
      prepared.current = null;
      return fail("check.error.image");
    }
    setThumb(prepared.current.thumbnail);
    await send(prepared.current);
  }

  function retry() {
    if (prepared.current) void send(prepared.current);
    else setPhase("idle");
  }

  function byHand() {
    start({ stub: { payType: "unknown" } });
    router.push("/check/review");
  }

  function pickSample(sample: Sample) {
    start({ stub: structuredClone(sample.stub), answers: structuredClone(sample.answers) });
    router.push("/check/review");
  }

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("check.title")}</h1>

      {phase === "idle" && (
        <>
          <p className="mt-3 text-lg text-gray-600">{t("check.subtitle")}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={() => photoInput.current?.click()}>
              {t("check.photo")}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={() => fileInput.current?.click()}
            >
              {t("check.upload")}
            </Button>
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFile}
          />
          <input
            ref={fileInput}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={onFile}
          />
          <p className="mt-4 text-sm text-gray-600">{t("check.tip")}</p>
          <div className="mt-4 flex justify-center">
            <Button variant="ghost" size="md" onClick={() => setSheetOpen(true)}>
              {t("check.sample")}
            </Button>
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">{t("check.privacy")}</p>
        </>
      )}

      {phase === "reading" && (
        <Card className="mt-6" role="status" aria-live="polite">
          {thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={t("check.previewAlt")}
              className="mx-auto mb-5 max-h-48 rounded-lg border border-gray-200"
            />
          )}
          <p className="text-lg font-semibold text-gray-900">{t("check.reading")}</p>
          <div className="mt-3">
            <ReadingBar />
          </div>
          <p className="mt-3 text-sm text-gray-600">{t("check.readingNote")}</p>
        </Card>
      )}

      {phase === "error" && (
        <Card className="mt-6 border-amber-300 bg-amber-50" role="alert">
          <p className="text-lg font-semibold text-gray-900">{t("check.error.title")}</p>
          <p className="mt-2 text-gray-700">{t(errorKey)}</p>
          <div className="mt-5 flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={retry}>
              {t("check.retry")}
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={byHand}>
              {t("check.byHand")}
            </Button>
          </div>
        </Card>
      )}

      <SampleSheet
        open={sheetOpen}
        highlightId={highlightId}
        onClose={() => setSheetOpen(false)}
        onPick={pickSample}
      />
    </PageContainer>
  );
}

export default function CheckPage() {
  return (
    <Suspense fallback={null}>
      <UploadScreen />
    </Suspense>
  );
}
