"use client";

import { useLanguage, useT, type Lang } from "@/lib/i18n";

const options: { value: Lang; labelKey: "lang.en" | "lang.es" }[] = [
  { value: "en", labelKey: "lang.en" },
  { value: "es", labelKey: "lang.es" },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const t = useT();

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="inline-flex rounded-full border border-gray-300 bg-white p-1"
    >
      {options.map((o) => {
        const active = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(o.value)}
            className={`min-h-11 min-w-12 rounded-full px-3 text-sm font-semibold transition-colors ${
              active
                ? "bg-accent text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t(o.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
