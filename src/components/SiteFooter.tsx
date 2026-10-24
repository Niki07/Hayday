"use client";

import Link from "next/link";
import PageContainer from "@/components/ui/PageContainer";
import { useT } from "@/lib/i18n";

export default function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50 py-6">
      <PageContainer className="flex flex-col gap-3 text-sm text-gray-600">
        <p>{t("footer.privacy")}</p>
        <p>{t("footer.estimate")}</p>
        <div className="flex flex-wrap gap-x-6">
          <Link
            href="/help"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4"
          >
            {t("footer.help")}
          </Link>
          <Link
            href="/terms"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4"
          >
            {t("footer.terms")}
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
}
