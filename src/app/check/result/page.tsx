"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import { dictionary, useLanguage, useT, type TKey } from "@/lib/i18n";
import { formatUsd } from "@/lib/fixtures/letters";
import { useCheck } from "@/lib/check-state";
import type { Finding } from "@/lib/types";

const LABOR_COMMISSIONER_URL = "https://www.dir.ca.gov/dlse/HowToFileWageClaim.htm";

const severityDot: Record<Finding["severity"], string> = {
  high: "bg-red-600",
  medium: "bg-amber-500",
  info: "bg-gray-400",
};

function SeverityTag({ severity }: { severity: Finding["severity"] }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
      <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${severityDot[severity]}`} />
      {t(`result.severity.${severity}` as TKey)}
    </span>
  );
}

function FindingCard({ finding, small = false }: { finding: Finding; small?: boolean }) {
  const t = useT();
  const { lang } = useLanguage();
  return (
    <Card className={small ? "p-4" : ""}>
      <div className="flex items-start justify-between gap-4">
        <h3 className={`${small ? "text-base" : "text-lg"} font-semibold leading-snug text-gray-900`}>
          {finding.title[lang]}
        </h3>
        {finding.amount > 0 && (
          <p className={`shrink-0 font-bold text-accent ${small ? "text-lg" : "text-2xl"}`}>
            {formatUsd(finding.amount)}
          </p>
        )}
      </div>
      <div className="mt-1">
        <SeverityTag severity={finding.severity} />
      </div>
      <p className="mt-3 leading-relaxed text-gray-700">{finding.explanation[lang]}</p>
      <p className="mt-3 text-sm text-gray-500">
        {t("result.rule")}: {finding.citation}
      </p>
    </Card>
  );
}

export default function ResultPage() {
  const t = useT();
  const router = useRouter();
  const { ready, result, reset } = useCheck();

  if (!ready) return <PageContainer aria-busy="true" />;

  if (!result) {
    return (
      <PageContainer className="flex flex-col items-start gap-6">
        <p className="text-lg text-gray-700">{t("result.noData")}</p>
        <Button href="/check">{t("result.noData.cta")}</Button>
      </PageContainer>
    );
  }

  const byAmount = (a: Finding, b: Finding) => b.amount - a.amount;
  const main = result.findings.filter((f) => f.severity !== "info").sort(byAmount);
  const notes = result.findings.filter((f) => f.severity === "info").sort(byAmount);
  const looksCorrect = result.totalOwed === 0 && main.length === 0;

  function checkAnother() {
    reset();
    router.push("/check");
  }

  return (
    <PageContainer className="flex flex-col gap-8">
      {looksCorrect ? (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-xl text-white"
            >
              ✓
            </span>
            <h1 className="text-2xl font-bold leading-tight text-green-800 sm:text-3xl">
              {t("result.correct.title")}
            </h1>
          </div>
          <p className="mt-4 text-gray-700">{t("result.correct.body")}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {result.checkedRules.map((id) => {
              const key = `result.rule.${id}` as TKey;
              return (
                <li key={id} className="flex gap-2 text-gray-800">
                  <span aria-hidden className="text-green-700">
                    ✓
                  </span>
                  {key in dictionary.en ? t(key) : id}
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section>
          {result.totalOwed > 0 ? (
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              {t("result.owed")}{" "}
              <span className="whitespace-nowrap text-accent">{formatUsd(result.totalOwed)}</span>
            </h1>
          ) : (
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              {t("result.problems")}
            </h1>
          )}
          <p className="mt-2 text-gray-600">{t("result.sub")}</p>
        </section>
      )}

      {main.length > 0 && (
        <section className="flex flex-col gap-4" aria-label={t("result.items")}>
          {main.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </section>
      )}

      {notes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-700">{t("result.also")}</h2>
          {notes.map((f) => (
            <FindingCard key={f.id} finding={f} small />
          ))}
        </section>
      )}

      <section className="rounded-2xl bg-gray-50 p-5">
        <p className="text-gray-700">{t("result.disclaimer")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button href="/help" variant="secondary" className="w-full">
            {t("help.legalAid")}
          </Button>
          <Button href={LABOR_COMMISSIONER_URL} variant="secondary" className="w-full">
            {t("help.fileClaim")}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        {!looksCorrect && (
          <Button href="/check/claim" className="w-full">
            {t("result.claim")}
          </Button>
        )}
        <Button
          variant={looksCorrect ? "primary" : "secondary"}
          onClick={checkAnother}
          className="w-full"
        >
          {t("result.again")}
        </Button>
        <Button href="/check/review" variant="ghost" size="md" className="w-full">
          {t("result.edit")}
        </Button>
      </section>
    </PageContainer>
  );
}
