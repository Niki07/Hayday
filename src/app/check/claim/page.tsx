"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import { dictionary, useLanguage, useT, type Lang, type TKey } from "@/lib/i18n";
import { formatUsd } from "@/lib/fixtures/letters";
import { useCheck } from "@/lib/check-state";
import type { CheckResult, PayStub, WorkerAnswers } from "@/lib/types";
import "./print.css";

type Letter = { en: string; es: string };
const LANGS: Lang[] = ["en", "es"];
const LABOR_COMMISSIONER_URL = "https://www.dir.ca.gov/dlse/HowToFileWageClaim.htm";

// Letters written this session, so going back and forth between result and claim does not pay for
// another 8–10 s model call. `pending` shares one request between React's double effect run in dev.
const letterCache = new Map<string, Letter>();
const pending = new Map<string, Promise<Letter>>();

function requestLetter(key: string, body: unknown): Promise<Letter> {
  const cached = letterCache.get(key);
  if (cached) return Promise.resolve(cached);
  let promise = pending.get(key);
  if (!promise) {
    promise = fetch("/api/claim-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || typeof json?.en !== "string" || typeof json?.es !== "string") {
          throw new Error(json?.message ?? `HTTP ${res.status}`);
        }
        const letter: Letter = { en: json.en, es: json.es };
        letterCache.set(key, letter);
        return letter;
      })
      .finally(() => pending.delete(key));
    pending.set(key, promise);
  }
  return promise;
}

type Outcome = { key: string; letter?: Letter; failed?: boolean };

export default function ClaimPage() {
  const t = useT();
  const { ready, stub, answers, result } = useCheck();

  if (!ready) return <PageContainer aria-busy="true" />;

  if (!stub || !answers || !result) {
    return (
      <PageContainer className="flex flex-col items-start gap-6">
        <p className="text-lg text-gray-700">{t("claim.noData")}</p>
        <Button href="/check">{t("claim.noData.cta")}</Button>
      </PageContainer>
    );
  }

  return <Claim stub={stub} answers={answers} result={result} />;
}

function Claim({
  stub,
  answers,
  result,
}: {
  stub: PayStub;
  answers: WorkerAnswers;
  result: CheckResult;
}) {
  const t = useT();
  const { lang } = useLanguage();

  const [nameInput, setNameInput] = useState("");
  const [request, setRequest] = useState({ name: "", attempt: 0 });
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [tab, setTab] = useState<Lang | null>(null);
  const [copied, setCopied] = useState<Lang | "failed" | null>(null);

  const requestKey = JSON.stringify([result, request.name, request.attempt]);
  const cached = letterCache.get(requestKey);

  useEffect(() => {
    if (letterCache.has(requestKey)) return;
    let cancelled = false;
    const body = { stub, answers, result, ...(request.name ? { workerName: request.name } : {}) };
    requestLetter(requestKey, body).then(
      (letter) => !cancelled && setOutcome({ key: requestKey, letter }),
      () => !cancelled && setOutcome({ key: requestKey, failed: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [requestKey, stub, answers, result, request.name]);

  const letter = cached ?? (outcome?.key === requestKey ? outcome.letter : undefined);
  const failed = !letter && outcome?.key === requestKey && outcome.failed;
  const activeTab = tab ?? lang;

  const findings = useMemo(
    () => [...result.findings].sort((a, b) => b.amount - a.amount),
    [result.findings],
  );

  async function copy(which: Lang) {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter[which]);
      setCopied(which);
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied(null), 3000);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="no-print mx-auto flex max-w-[640px] flex-col gap-2">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">{t("claim.heading")}</h1>
        <p className="text-gray-600">{t("claim.intro")}</p>
      </div>

      <form
        className="no-print mx-auto mt-6 flex max-w-[640px] flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setRequest((r) => ({ name: nameInput.trim(), attempt: r.attempt }));
        }}
      >
        <label htmlFor="worker-name" className="font-semibold text-gray-900">
          {t("claim.name.label")}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="worker-name"
            type="text"
            autoComplete="name"
            maxLength={200}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="min-h-11 w-full rounded-xl border-2 border-gray-300 px-4 text-base focus:border-accent focus:outline-none"
          />
          <Button
            type="submit"
            variant="secondary"
            size="md"
            disabled={!letter || nameInput.trim() === request.name}
            className="shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("claim.name.update")}
          </Button>
        </div>
        <p className="text-sm text-gray-500">{t("claim.name.hint")}</p>
      </form>

      {!letter && !failed && (
        <div
          role="status"
          className="no-print mx-auto mt-8 flex max-w-[640px] flex-col gap-3 rounded-2xl bg-accent-soft p-6"
        >
          <p className="text-lg font-semibold text-accent">{t("claim.writing")}</p>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
          </div>
          <p className="text-sm text-gray-600">{t("claim.writing.sub")}</p>
        </div>
      )}

      {failed && (
        <div
          role="alert"
          className="no-print mx-auto mt-8 flex max-w-[640px] flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <p className="font-semibold text-red-800">{t("claim.error")}</p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setRequest((r) => ({ ...r, attempt: r.attempt + 1 }))}
          >
            {t("claim.retry")}
          </Button>
        </div>
      )}

      {letter && (
        <>
          <div className="no-print mx-auto mt-8 flex max-w-[640px] flex-col gap-2">
            <Button onClick={() => window.print()} className="w-full">
              {t("claim.download")}
            </Button>
            <p className="text-center text-sm text-gray-500">{t("claim.download.hint")}</p>
          </div>

          <div
            role="tablist"
            aria-label={t("claim.heading")}
            className="no-print mx-auto mt-8 flex max-w-[640px] rounded-xl bg-gray-100 p-1 lg:hidden"
          >
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                id={`tab-${l}`}
                aria-selected={activeTab === l}
                aria-controls={`letter-${l}`}
                onClick={() => setTab(l)}
                className={`min-h-11 flex-1 rounded-lg text-base font-semibold ${
                  activeTab === l ? "bg-white text-accent shadow-sm" : "text-gray-600"
                }`}
              >
                {t(`claim.tab.${l}` as TKey)}
              </button>
            ))}
          </div>

          <div className="letter-columns mt-4 grid gap-6 lg:mt-8 lg:grid-cols-2">
            {LANGS.map((l) => (
              <section
                key={l}
                id={`letter-${l}`}
                role="tabpanel"
                aria-labelledby={`tab-${l}`}
                lang={l}
                className={`letter-page rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:block ${
                  activeTab === l ? "block" : "hidden"
                }`}
              >
                <div className="no-print mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-accent">
                    {t(`claim.tab.${l}` as TKey)}
                  </h2>
                  <Button variant="secondary" size="md" onClick={() => copy(l)}>
                    {copied === l ? t("claim.copied") : t("claim.copy")}
                  </Button>
                </div>
                <div className="letter-text whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900">
                  {letter[l]}
                </div>
              </section>
            ))}
          </div>

          {copied === "failed" && (
            <p role="status" className="no-print mt-3 text-center text-sm text-red-700">
              {t("claim.copyFailed")}
            </p>
          )}

          {/* Printed only: the third page, with both languages side by side in one table. */}
          <section className="print-only letter-text">
            <h2 style={{ fontSize: "14pt", fontWeight: 700 }}>
              {dictionary.en["claim.table.title"]} / {dictionary.es["claim.table.title"]}
            </h2>
            <table className="findings-table mt-3">
              <thead>
                <tr>
                  <th>
                    {dictionary.en["claim.table.issue"]} / {dictionary.es["claim.table.issue"]}
                  </th>
                  <th>
                    {dictionary.en["claim.table.rule"]} / {dictionary.es["claim.table.rule"]}
                  </th>
                  <th className="amount">
                    {dictionary.en["claim.table.amount"]} / {dictionary.es["claim.table.amount"]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {findings.map((f) => (
                  <tr key={f.id}>
                    <td>
                      {f.title.en}
                      <br />
                      <em>{f.title.es}</em>
                    </td>
                    <td>{f.citation}</td>
                    <td className="amount">{f.amount > 0 ? formatUsd(f.amount) : "—"}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}>
                    <strong>
                      {dictionary.en["claim.table.total"]} / {dictionary.es["claim.table.total"]}
                    </strong>
                  </td>
                  <td className="amount">
                    <strong>{formatUsd(result.totalOwed)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: "12pt", fontSize: "10pt" }}>
              {dictionary.en["result.disclaimer"]}
              <br />
              <em>{dictionary.es["result.disclaimer"]}</em>
            </p>
          </section>

          <section className="no-print mx-auto mt-10 max-w-[640px]">
            <h2 className="text-xl font-bold text-gray-900">{t("claim.next.title")}</h2>
            <ul className="mt-4 flex flex-col gap-4">
              {(
                [
                  ["claim.next.1"],
                  ["claim.next.2"],
                  ["claim.next.3", "/help", "claim.next.3.link"],
                  ["claim.next.4", LABOR_COMMISSIONER_URL, "claim.next.4.link"],
                ] as [TKey, string?, TKey?][]
              ).map(([text, href, linkText]) => (
                <li key={text} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-accent text-accent"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="text-gray-800">{t(text)}</p>
                    {href && linkText && (
                      <a
                        href={href}
                        {...(href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4"
                      >
                        {t(linkText)}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <div className="no-print mx-auto mt-8 max-w-[640px]">
        <Button href="/check/result" variant="ghost" size="md" className="w-full">
          {t("claim.back")}
        </Button>
      </div>
    </div>
  );
}
