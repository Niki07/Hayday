"use client";

import PageContainer from "@/components/ui/PageContainer";
import { useT, type TKey } from "@/lib/i18n";

// Placeholder used by the /check/* routes until handoffs 04 and 05 replace them.
export default function StubPage({ titleKey }: { titleKey: TKey }) {
  const t = useT();
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t(titleKey)}</h1>
      <p className="mt-3 text-gray-600">{t("stub.coming")}</p>
    </PageContainer>
  );
}
