"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import { useT, type TKey } from "@/lib/i18n";

const STEPS = ["s1", "s2", "s3"] as const;
const NOTES = ["privacy", "accuracy", "organizers"] as const;

export default function HowItWorksPage() {
  const t = useT();
  return (
    <PageContainer className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("how.title")}</h1>
        <p className="text-lg leading-7 text-gray-600">{t("how.intro")}</p>
      </section>

      <section className="flex flex-col gap-4">
        {STEPS.map((s) => (
          <Card key={s} className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-accent">{t(`how.${s}.title` as TKey)}</h2>
            <p className="leading-7 text-gray-800">{t(`how.${s}.body` as TKey)}</p>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        {NOTES.map((n) => (
          <div key={n} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{t(`how.${n}.title` as TKey)}</h2>
            <p className="leading-7 text-gray-700">{t(`how.${n}.body` as TKey)}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Button href="/check" className="w-full sm:w-auto">
          {t("how.cta")}
        </Button>
        <Button href="/rules" variant="secondary" className="w-full sm:w-auto">
          {t("how.rules")}
        </Button>
      </section>
    </PageContainer>
  );
}
