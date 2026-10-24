"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import PageContainer from "@/components/ui/PageContainer";
import { useT } from "@/lib/i18n";

export default function SiteHeader() {
  const t = useT();
  return (
    <header className="border-b border-gray-200 bg-white">
      <PageContainer className="flex flex-wrap items-center justify-between gap-x-4 py-3">
        <Link
          href="/"
          aria-label={t("nav.home")}
          className="flex min-h-11 items-center gap-2 text-2xl font-bold tracking-tight text-accent"
        >
          <Image
            src="/brand/hayday-logo-mark.svg"
            alt=""
            width={32}
            height={32}
            priority
            className="h-8 w-8"
          />
          Hayday
        </Link>
        <nav
          aria-label={t("header.how")}
          className="order-last flex basis-full items-center gap-5 sm:order-none sm:basis-auto"
        >
          <Link
            href="/how-it-works"
            className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-semibold text-accent underline underline-offset-4"
          >
            {t("header.how")}
          </Link>
          <Link
            href="/organizer"
            className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-semibold text-accent underline underline-offset-4"
          >
            {t("header.organizers")}
          </Link>
        </nav>
        <LanguageToggle />
      </PageContainer>
    </header>
  );
}
