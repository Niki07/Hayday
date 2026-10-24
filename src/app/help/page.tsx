"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import { counties } from "@/lib/help-data";
import { useT } from "@/lib/i18n";

export default function HelpPage() {
  const t = useT();

  return (
    <PageContainer className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("help.title")}</h1>
        <p className="text-lg leading-7 text-gray-600">{t("help.intro")}</p>
      </section>

      <section>
        <Card className="border-accent/30 bg-accent-soft">
          <h2 className="text-lg font-semibold text-accent">{t("help.labor.title")}</h2>
          <p className="mt-1 font-semibold text-gray-900">{t("help.labor.name")}</p>
          <p className="mt-1 text-gray-700">{t("help.labor.desc")}</p>
          <Button
            href="https://www.dir.ca.gov/dlse/HowToFileWageClaim.htm"
            className="mt-4 w-full"
          >
            {t("help.visit")}
          </Button>
        </Card>
      </section>

      {counties.map((c) => (
        <section key={c.id} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-gray-900">{t(c.nameKey)}</h2>
          {c.nearby && <p className="text-sm text-gray-600">{t("help.nearby")}</p>}
          {c.entries.map((e) => (
            <Card key={`${c.id}-${e.nameKey}`}>
              <h3 className="text-base font-semibold text-gray-900">{t(e.nameKey)}</h3>
              {e.officeKey && <p className="mt-0.5 text-sm font-medium text-accent">{t(e.officeKey)}</p>}
              <p className="mt-1 text-gray-700">{t(e.descKey)}</p>
              <Button href={e.url} variant="secondary" size="md" className="mt-3 w-full">
                {t("help.visit")}
              </Button>
            </Card>
          ))}
        </section>
      ))}

      <p className="text-sm text-gray-600">{t("help.disclaimer")}</p>
    </PageContainer>
  );
}
