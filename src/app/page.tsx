"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import PayStubIllustration from "@/components/PayStubIllustration";
import { useT } from "@/lib/i18n";

export default function Home() {
  const t = useT();
  const checks = ["home.checks.1", "home.checks.2", "home.checks.3"] as const;

  return (
    <PageContainer className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900">
          {t("home.headline")}
        </h1>
        <p className="text-lg leading-7 text-gray-600">{t("home.subline")}</p>
        <div className="mt-2 flex flex-col gap-3">
          <Button href="/check" className="w-full">
            {t("home.cta")}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-gray-900">{t("home.checks.title")}</h2>
        <ul className="flex flex-col gap-3">
          {checks.map((k) => (
            <li key={k}>
              <Card className="flex items-center gap-3 py-4">
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                <span className="text-base text-gray-800">{t(k)}</span>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <figure className="flex flex-col items-center gap-3 rounded-2xl bg-gray-50 p-5">
          <PayStubIllustration />
          <figcaption className="text-center text-sm text-gray-600">
            {t("home.stub.caption")}
          </figcaption>
        </figure>
      </section>

      <section>
        <Card className="border-accent/30 bg-accent-soft">
          <h2 className="text-lg font-semibold text-accent">{t("home.privacy.title")}</h2>
          <p className="mt-1 text-gray-800">{t("home.privacy.body")}</p>
        </Card>
      </section>
    </PageContainer>
  );
}
