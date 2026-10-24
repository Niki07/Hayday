// Organizer view helpers (handoff 09): initials, the pattern across stubs, and the CSV export.
// No amounts are computed here; they all come from checkStubOnly in src/lib/rules/organizer.ts (D-007).

import type { Lang } from "./i18n";
import { round2, sum } from "./rules/format";
import type { OrganizerResult } from "./rules/organizer";
import { RULES } from "./rules";
import type { PayStub } from "./types";

export type OrganizerRow = { stub: PayStub; result: OrganizerResult };

/** "Maria del Carmen Hernandez" → "M.H.". The full name is never shown or exported. */
export function initials(name?: string): string {
  const words = (name ?? "").trim().split(/\s+/).filter((w) => /\p{L}/u.test(w));
  if (words.length === 0) return "—";
  const first = words[0].match(/\p{L}/u)![0];
  const last = words.length > 1 ? words[words.length - 1].match(/\p{L}/u)![0] : "";
  return `${first.toUpperCase()}.${last ? `${last.toUpperCase()}.` : ""}`;
}

export type Pattern = {
  id: string;
  title: { en: string; es: string };
  count: number;
  amount: number;
  estimated: boolean;
};

export type OrganizerSummary = {
  stubs: number;
  stubsWithIssues: number;
  totalOwed: number;
  patterns: Pattern[];
};

/** Which rule is broken on how many stubs, most frequent first (ties: larger amount, then RULES order). */
export function summarize(rows: OrganizerRow[]): OrganizerSummary {
  const byId = new Map<string, Pattern>();
  for (const { result } of rows) {
    for (const f of result.findings) {
      const p = byId.get(f.id) ?? { id: f.id, title: f.title, count: 0, amount: 0, estimated: false };
      p.count += 1;
      p.amount = round2(p.amount + f.amount);
      p.estimated ||= result.estimated.includes(f.id);
      byId.set(f.id, p);
    }
  }
  const order = RULES.map((r) => r.id);
  const patterns = [...byId.values()].sort(
    (a, b) => b.count - a.count || b.amount - a.amount || order.indexOf(a.id) - order.indexOf(b.id),
  );
  return {
    stubs: rows.length,
    stubsWithIssues: rows.filter((r) => r.result.findings.length > 0).length,
    totalOwed: round2(sum(rows.map((r) => r.result.totalOwed))),
    patterns,
  };
}

/** "09/14/2026 – 09/20/2026" from ISO dates; "—" when missing. */
export function periodLabel(stub: PayStub): string {
  const fmt = (iso?: string) => {
    const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[2]}/${m[3]}/${m[1]}` : undefined;
  };
  const a = fmt(stub.periodStart);
  const b = fmt(stub.periodEnd);
  if (!a && !b) return "—";
  return `${a ?? "?"} – ${b ?? "?"}`;
}

function csvCell(value: string | number | undefined): string {
  const s = value === undefined ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export type CsvLabels = {
  headers: string[]; // worker, period, pay type, hours, gross, issues, owed
  total: string;
  estimated: string; // suffix for estimated amounts, e.g. "est."
  payType: (t: PayStub["payType"]) => string;
  note: string;
};

/** One row per stub plus a totals row and a notes row. Initials only. */
export function toCsv(rows: OrganizerRow[], lang: Lang, labels: CsvLabels): string {
  const lines: string[][] = [labels.headers];
  for (const { stub, result } of rows) {
    const est = result.findings.some((f) => result.estimated.includes(f.id) && f.amount > 0);
    lines.push([
      initials(stub.employeeName),
      periodLabel(stub),
      labels.payType(stub.payType),
      stub.hoursWorked !== undefined ? String(stub.hoursWorked) : "",
      stub.grossPay !== undefined ? stub.grossPay.toFixed(2) : "",
      result.findings.map((f) => f.title[lang]).join("; "),
      result.totalOwed.toFixed(2) + (est ? ` (${labels.estimated})` : ""),
    ]);
  }
  const s = summarize(rows);
  lines.push([
    labels.total,
    "",
    "",
    String(round2(sum(rows.map((r) => r.stub.hoursWorked ?? 0)))),
    round2(sum(rows.map((r) => r.stub.grossPay ?? 0))).toFixed(2),
    "",
    s.totalOwed.toFixed(2),
  ]);
  lines.push([labels.note]);
  // Leading BOM so Excel opens accented Spanish text correctly.
  return "﻿" + lines.map((l) => l.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
