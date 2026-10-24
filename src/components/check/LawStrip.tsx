"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import ExternalLink from "@/components/ui/ExternalLink";
import { useLanguage, useT } from "@/lib/i18n";
import { RATE_SOURCE, RULE_SOURCES, formatLongDate } from "@/lib/rules/sources";

// "Checked against California law": every rule that ran, each with a link to the law text.
// Closed by default on phones so the findings stay first; open from 640 px up. alwaysOpen keeps it open (green result).
export default function LawStrip({ ruleIds, alwaysOpen = false }: { ruleIds: string[]; alwaysOpen?: boolean }) {
  const t = useT();
  const { lang } = useLanguage();
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (alwaysOpen || window.matchMedia("(min-width: 640px)").matches) {
      if (ref.current) ref.current.open = true;
    }
  }, [alwaysOpen]);

  return (
    <details ref={ref} className="group rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-900">
        {t("result.law.title")}
        <span aria-hidden className="ml-auto pl-3 text-gray-500 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <ul className="mt-2 flex flex-col gap-2 text-sm text-gray-700">
        {ruleIds.map((id) => {
          const source = RULE_SOURCES[id];
          if (!source) return null;
          return (
            <li key={id}>
              <span className="text-gray-900">{source.title[lang]}</span> —{" "}
              <ExternalLink href={source.url}>{source.citation}</ExternalLink>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-gray-600">
        <ExternalLink href={RATE_SOURCE.url} className="font-normal">
          {t("result.law.rates").replace("{date}", formatLongDate(RATE_SOURCE.verifiedOn, lang))}
        </ExternalLink>
      </p>
      <Link
        href="/rules"
        className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4"
      >
        {t("result.law.how")}
      </Link>
    </details>
  );
}
