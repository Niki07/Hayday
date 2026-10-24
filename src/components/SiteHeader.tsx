"use client";

import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import PageContainer from "@/components/ui/PageContainer";
import { useT } from "@/lib/i18n";

export default function SiteHeader() {
  const t = useT();
  return (
    <header className="border-b border-gray-200 bg-white">
      <PageContainer className="flex items-center justify-between py-3">
        <Link
          href="/"
          aria-label={t("nav.home")}
          className="flex min-h-11 items-center text-2xl font-bold tracking-tight text-accent"
        >
          Hayday
        </Link>
        <LanguageToggle />
      </PageContainer>
    </header>
  );
}
