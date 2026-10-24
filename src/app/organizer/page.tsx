"use client";

// Organizer view (handoff 09). Hidden: not linked from anywhere, noindex via layout.tsx.
// Several stubs from one employer → which rule is broken on how many stubs. Stub-only checks (D-052).
// Nothing is persisted: rows live in React state and a reload clears them.

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ExternalLink from "@/components/ui/ExternalLink";
import Link from "next/link";
import {
  ORGANIZER_SAMPLE_COUNTY,
  ORGANIZER_SAMPLE_EMPLOYER,
  organizerSamples,
} from "@/lib/fixtures/organizer-samples";
import { prepareFile } from "@/lib/image";
import { useLanguage, useT, type TKey } from "@/lib/i18n";
import { initials, periodLabel, summarize, toCsv, type OrganizerRow } from "@/lib/organizer";
import { money } from "@/lib/rules/format";
import { RULE_SOURCES } from "@/lib/rules/sources";
import { checkStubOnly } from "@/lib/rules/organizer";
import type { PayStub } from "@/lib/types";
import "./print.css";

// Same list and values as the review page (src/app/check/review/page.tsx).
const VALLEY_COUNTIES: { value: string; label: TKey }[] = [
  { value: "Fresno", label: "county.fresno" },
  { value: "Kern", label: "county.kern" },
  { value: "Tulare", label: "county.tulare" },
  { value: "Kings", label: "county.kings" },
  { value: "Madera", label: "county.madera" },
  { value: "Merced", label: "county.merced" },
  { value: "Stanislaus", label: "county.stanislaus" },
  { value: "San Joaquin", label: "county.sanjoaquin" },
];
const OTHER_COUNTY = "Other";

const PAY_TYPE_LABEL: Record<PayStub["payType"], TKey> = {
  hourly: "review.payType.hourly",
  piece: "review.payType.piece",
  mixed: "review.payType.mixed",
  unknown: "org.payType.unknown",
};

/** Live extraction takes 7–15 s each; at most this many at once. */
const MAX_IN_FLIGHT = 2;
const REQUEST_TIMEOUT_MS = 75_000;

type Status = "queued" | "reading" | "done" | "error";
type Row = { key: string; status: Status; stub?: PayStub };

let nextKey = 0;
const newKey = () => `row-${++nextKey}`;

export default function OrganizerPage() {
  const t = useT();
  const { lang } = useLanguage();
  const [county, setCounty] = useState("Fresno");
  const [employer, setEmployer] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  const fileInput = useRef<HTMLInputElement>(null);
  const files = useRef(new Map<string, File>());
  const queue = useRef<string[]>([]);
  const inFlight = useRef(new Map<string, AbortController>());

  useEffect(() => {
    const flights = inFlight.current;
    return () => {
      queue.current = [];
      flights.forEach((c) => c.abort());
      flights.clear();
    };
  }, []);

  function setStatus(key: string, status: Status, stub?: PayStub) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, status, stub: stub ?? r.stub } : r)));
  }

  async function read(key: string) {
    const file = files.current.get(key);
    const ctrl = new AbortController();
    inFlight.current.set(key, ctrl);
    setStatus(key, "reading");
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      if (!file) throw new Error("missing_file");
      const prepared = await prepareFile(file);
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: prepared.base64, mimeType: prepared.mimeType }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`http_${res.status}`);
      const stub = (await res.json()) as PayStub;
      if (!stub || typeof stub.payType !== "string") throw new Error("bad_stub");
      if (inFlight.current.get(key) === ctrl) setStatus(key, "done", stub);
    } catch {
      if (inFlight.current.get(key) === ctrl) setStatus(key, "error");
    } finally {
      clearTimeout(timer);
      if (inFlight.current.get(key) === ctrl) inFlight.current.delete(key);
      pump();
    }
  }

  function pump() {
    while (inFlight.current.size < MAX_IN_FLIGHT && queue.current.length > 0) {
      void read(queue.current.shift()!);
    }
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // lets the same files be picked again
    if (picked.length === 0) return;
    const added: Row[] = picked.map((file) => {
      const key = newKey();
      files.current.set(key, file);
      queue.current.push(key);
      return { key, status: "queued" };
    });
    setRows((rs) => [...rs, ...added]);
    pump();
  }

  function retry(key: string) {
    setStatus(key, "queued");
    queue.current.push(key);
    pump();
  }

  function remove(key: string) {
    queue.current = queue.current.filter((k) => k !== key);
    inFlight.current.get(key)?.abort();
    inFlight.current.delete(key);
    files.current.delete(key);
    setRows((rs) => rs.filter((r) => r.key !== key));
    pump();
  }

  function clearAll() {
    queue.current = [];
    inFlight.current.forEach((c) => c.abort());
    inFlight.current.clear();
    files.current.clear();
    setRows([]);
  }


  const results = useMemo(
    () =>
      new Map(
        rows
          .filter((r) => r.status === "done" && r.stub)
          .map((r) => [r.key, { stub: r.stub!, result: checkStubOnly(r.stub!, county) }] as const),
      ),
    [rows, county],
  );
  const checked: OrganizerRow[] = [...results.values()];
  const summary = summarize(checked);

  function exportCsv() {
    const csv = toCsv(checked, lang, {
      headers: [
        t("org.col.worker"),
        t("org.col.period"),
        t("org.col.payType"),
        t("org.col.hours"),
        t("org.col.gross"),
        t("org.col.issues"),
        t("org.col.rule"),
        t("org.col.owed"),
      ],
      total: t("org.total"),
      estimated: t("org.est"),
      payType: (p) => t(PAY_TYPE_LABEL[p]),
      note: `${t("org.caveat")} ${t("org.estNote")}`,
    });
    const slug = employer.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `hayday-organizer${slug ? `-${slug}` : ""}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const busy = rows.some((r) => r.status === "queued" || r.status === "reading");
  const finishedCount = rows.filter((r) => r.status === "done" || r.status === "error").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const progressPct = rows.length ? Math.round((finishedCount / rows.length) * 100) : 0;
  const hoursTotal = checked.reduce((a, r) => a + (r.stub.hoursWorked ?? 0), 0);
  const grossTotal = checked.reduce((a, r) => a + (r.stub.grossPay ?? 0), 0);
  const anyEstimated = summary.patterns.some((p) => p.estimated);

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("org.title")}</h1>
        <p className="text-lg text-gray-600">{t("org.intro")}</p>
        <p className="text-sm text-gray-500">{t("org.privacy")}</p>
        {employer.trim() && (
          <p className="org-print-only text-lg font-semibold text-gray-900">
            {t("org.employerLabel")}: {employer.trim()}
          </p>
        )}
      </header>

      <Card className="org-no-print mt-6 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="font-medium text-gray-900">{t("org.county")}</span>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="min-h-11 rounded-xl border border-gray-300 bg-white px-3 text-base"
            >
              <optgroup label={t("review.countyValley")}>
                {VALLEY_COUNTIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {t(c.label)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t("review.countyOtherGroup")}>
                <option value={OTHER_COUNTY}>{t("org.countyOther")}</option>
              </optgroup>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium text-gray-900">{t("org.employer")}</span>
            <input
              type="text"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              placeholder={t("org.employerPlaceholder")}
              maxLength={120}
              className="min-h-11 rounded-xl border border-gray-300 px-3 text-base"
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="md" onClick={() => fileInput.current?.click()}>
            {t("org.addPhotos")}
          </Button>
          {rows.length > 0 && (
            <Button size="md" variant="ghost" onClick={clearAll}>
              {t("org.clear")}
            </Button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={onFiles}
          data-testid="org-files"
        />
        <p className="text-sm text-gray-600">{t("org.photosNote")}</p>
      </Card>

      {rows.length === 0 ? (
        <p className="mt-8 text-center text-gray-600">{t("org.empty")}</p>
      ) : (
        <>
          <div className="org-no-print mt-6 rounded-2xl border border-gray-200 bg-white p-4" role="status" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className={busy ? "font-semibold text-gray-900" : "font-semibold text-accent"}>
                {busy ? t("org.progress.reading") : t("org.progress.done")}
              </span>
              <span className="text-gray-600">
                {finishedCount} {t("org.progress.of")} {rows.length} {t("org.progress.read")}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${busy ? "bg-accent/70" : "bg-accent"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {errorCount > 0 && !busy && (
              <p className="mt-2 text-sm text-red-700">
                {errorCount} {t("org.progress.failed")}
              </p>
            )}
          </div>

          <section className="mt-8 grid gap-3 sm:grid-cols-3" aria-live="polite">
            <Card>
              <p className="text-sm text-gray-600">{t("org.summary.stubs")}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{summary.stubs}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">{t("org.summary.issues")}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{summary.stubsWithIssues}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">{t("org.summary.total")}</p>
              <p className="mt-1 text-3xl font-bold text-accent">
                {money(summary.totalOwed)}
                {anyEstimated && <span className="ml-1 text-base font-medium text-gray-500">{t("org.est")}</span>}
              </p>
            </Card>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">{t("org.patterns")}</h2>
            {summary.patterns.length === 0 ? (
              <p className="mt-3 text-gray-600">{checked.length > 0 ? t("org.patternsNone") : "…"}</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {summary.patterns.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-medium text-gray-900">{p.title[lang]}</span>
                      <span className="text-gray-700">
                        {p.count} {t("org.of")} {summary.stubs} {t("org.stubs")}
                        {" — "}
                        <span className="font-semibold">{money(p.amount)}</span>
                        {p.estimated && p.amount > 0 && <span className="ml-1 text-sm text-gray-500">{t("org.est")}</span>}
                      </span>
                    </div>
                    {RULE_SOURCES[p.id] && (
                      <p className="text-sm text-gray-600">
                        {t("org.rule")}{" "}
                        <ExternalLink href={RULE_SOURCES[p.id].url} className="font-medium text-accent underline underline-offset-4">
                          {RULE_SOURCES[p.id].citation}
                        </ExternalLink>
                      </p>
                    )}
                    <div className="h-2 w-full rounded-full bg-gray-100" aria-hidden>
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${(p.count / Math.max(1, summary.stubs)) * 100}%`, printColorAdjust: "exact" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 rounded-xl bg-accent-soft p-3 text-sm text-gray-800">{t("org.caveat")}</p>
            <Link href="/rules" className="org-no-print mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4">
              {t("org.howWeCheck")}
            </Link>
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">{t("org.table")}</h2>
              <div className="org-no-print flex gap-2">
                <Button size="md" variant="secondary" onClick={exportCsv} disabled={checked.length === 0}>
                  {t("org.exportCsv")}
                </Button>
                <Button size="md" variant="secondary" onClick={() => window.print()} disabled={checked.length === 0}>
                  {t("org.print")}
                </Button>
              </div>
            </div>
            <div className="org-table-wrap mt-3 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{t("org.col.worker")}</th>
                    <th className="px-3 py-2 font-semibold">{t("org.col.period")}</th>
                    <th className="px-3 py-2 font-semibold">{t("org.col.payType")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("org.col.hours")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("org.col.gross")}</th>
                    <th className="min-w-[260px] px-3 py-2 font-semibold">{t("org.col.issues")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("org.col.owed")}</th>
                    <th className="org-no-print px-3 py-2">
                      <span className="sr-only">{t("org.remove")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => {
                    const r = results.get(row.key);
                    return (
                      <tr key={row.key} className={row.status === "done" ? "" : "org-no-print"}>
                        {r ? (
                          <>
                            <td className="px-3 py-2 font-medium">{initials(r.stub.employeeName)}</td>
                            <td className="whitespace-nowrap px-3 py-2">{periodLabel(r.stub)}</td>
                            <td className="px-3 py-2">{t(PAY_TYPE_LABEL[r.stub.payType] ?? "org.payType.unknown")}</td>
                            <td className="px-3 py-2 text-right">{r.stub.hoursWorked ?? "—"}</td>
                            <td className="px-3 py-2 text-right">
                              {r.stub.grossPay !== undefined ? money(r.stub.grossPay) : "—"}
                            </td>
                            <td className="px-3 py-2">
                              {r.result.findings.length === 0 ? (
                                <span className="text-gray-500">{t("org.noIssues")}</span>
                              ) : (
                                <ul className="flex flex-col gap-0.5">
                                  {r.result.findings.map((f) => (
                                    <li key={f.id}>
                                      {f.title[lang]}{" "}
                                      <span className="whitespace-nowrap text-xs text-gray-500">({f.citation})</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">
                              {money(r.result.totalOwed)}
                              {r.result.findings.some((f) => r.result.estimated.includes(f.id) && f.amount > 0) && (
                                <span className="ml-1 text-xs font-normal text-gray-500">{t("org.est")}</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <td colSpan={7} className="px-3 py-3" role="status">
                            {row.status === "error" ? (
                              <span className="flex flex-wrap items-center gap-3 text-amber-800">
                                {t("org.status.error")}
                                <button
                                  type="button"
                                  onClick={() => retry(row.key)}
                                  className="font-semibold text-accent underline underline-offset-4"
                                >
                                  {t("org.retry")}
                                </button>
                              </span>
                            ) : (
                              <span className="text-gray-600">
                                {t(row.status === "reading" ? "org.status.reading" : "org.status.queued")}
                              </span>
                            )}
                          </td>
                        )}
                        <td className="org-no-print px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => remove(row.key)}
                            className="text-sm font-medium text-gray-600 underline underline-offset-4 hover:text-gray-900"
                          >
                            {t("org.remove")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {checked.length > 0 && (
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                    <tr>
                      <td className="px-3 py-2">{t("org.total")}</td>
                      <td className="px-3 py-2" colSpan={2} />
                      <td className="px-3 py-2 text-right">{Math.round(hoursTotal * 100) / 100}</td>
                      <td className="px-3 py-2 text-right">{money(grossTotal)}</td>
                      <td className="px-3 py-2" />
                      <td className="whitespace-nowrap px-3 py-2 text-right">{money(summary.totalOwed)}</td>
                      <td className="org-no-print" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {anyEstimated && <p className="mt-2 text-sm text-gray-500">{t("org.estNote")}</p>}
            {busy && <p className="org-no-print mt-2 text-sm text-gray-600">{t("org.photosNote")}</p>}
          </section>
        </>
      )}
    </div>
  );
}
