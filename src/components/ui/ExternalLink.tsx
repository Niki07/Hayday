"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";

// A link to another site: new tab, arrow glyph, and a screen-reader note.
export default function ExternalLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`font-medium text-accent underline underline-offset-4 ${className}`}
    >
      {children}
      <span aria-hidden> ↗</span>
      <span className="sr-only"> {t("result.law.opens")}</span>
    </a>
  );
}
