"use client";

import Button from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import { useT, type TKey } from "@/lib/i18n";

const SECTIONS = ["s1", "s2", "s3", "s4", "s5"] as const;

export default function TermsPage() {
  const t = useT();
  return (
    <PageContainer className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("terms.title")}</h1>
        <p className="text-lg leading-7 text-gray-600">{t("terms.intro")}</p>
      </section>
      {SECTIONS.map((s) => (
        <section key={s} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-gray-900">{t(`terms.${s}.title` as TKey)}</h2>
          <p className="leading-7 text-gray-800">{t(`terms.${s}.body` as TKey)}</p>
        </section>
      ))}
      <Button href="/help" variant="secondary" className="w-full sm:w-auto">
        {t("terms.help")}
      </Button>
    </PageContainer>
  );
}
