"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ExternalLink from "@/components/ui/ExternalLink";
import PageContainer from "@/components/ui/PageContainer";
import { useLanguage, useT, type TKey } from "@/lib/i18n";
import {
  DAILY_DOUBLE_AFTER,
  DAILY_OT_AFTER,
  STATE_MINIMUM_WAGE,
  WEEKLY_OT_AFTER,
} from "@/lib/rules/rates";
import { RATE_SOURCE, RULE_SOURCES, formatLongDate } from "@/lib/rules/sources";

export default function RulesPage() {
  const t = useT();
  const { lang } = useLanguage();
  const verified = formatLongDate(RATE_SOURCE.verifiedOn, lang);

  return (
    <PageContainer className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("rules.title")}</h1>
        <p className="text-lg leading-7 text-gray-600">{t("rules.intro")}</p>
        <p className="text-sm text-gray-600">{t("rules.verified").replace("{date}", verified)}</p>
      </section>

      {Object.values(RULE_SOURCES).map((rule) => (
        <section key={rule.id} id={rule.id}>
          <Card className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{rule.title[lang]}</h2>
            <p className="leading-7 text-gray-800">{t(`rules.${rule.id}.body` as TKey)}</p>

            {rule.id === "min-wage" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{t("rules.wage.title")}</h3>
                <ul className="mt-1 text-gray-700">
                  {STATE_MINIMUM_WAGE.map((e) => (
                    <li key={e.effective}>
                      {t("rules.wage.row")
                        .replace("{date}", formatLongDate(e.effective, lang))
                        .replace("{rate}", `$${e.rate.toFixed(2)}`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rule.id === "daily-ot" && (
              <p className="text-gray-700">
                {t("rules.threshold.daily")
                  .replace("{a}", String(DAILY_OT_AFTER))
                  .replace("{b}", String(DAILY_DOUBLE_AFTER))}
              </p>
            )}
            {rule.id === "weekly-ot" && (
              <p className="text-gray-700">
                {t("rules.threshold.weekly").replace("{a}", String(WEEKLY_OT_AFTER))}
              </p>
            )}
            {rule.effective && (
              <p className="text-sm text-gray-600">
                {t("rules.effective").replace("{date}", formatLongDate(rule.effective, lang))}
              </p>
            )}

            <div className="flex flex-col gap-1 text-sm">
              <p>
                <span className="text-gray-600">{t("rules.law")}: </span>
                <ExternalLink href={rule.url}>{rule.citation}</ExternalLink>
              </p>
              {rule.also?.map((link) => (
                <p key={link.url}>
                  <ExternalLink href={link.url}>{link.label[lang]}</ExternalLink>
                </p>
              ))}
            </div>

            <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{t("rules.notCovered")}: </span>
              {rule.notCovered[lang]}
            </p>
          </Card>
        </section>
      ))}

      <Button href="/check" className="w-full sm:w-auto">
        {t("rules.cta")}
      </Button>
    </PageContainer>
  );
}
