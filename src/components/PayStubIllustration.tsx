"use client";

import { useT } from "@/lib/i18n";

// Inline SVG so no external image is needed. Labels follow the language toggle;
// numbers are made up and generic.
export default function PayStubIllustration() {
  const t = useT();
  const rows: [string, string][] = [
    [t("stub.hours"), "46.0"],
    [t("stub.rate"), "$16.50"],
    [t("stub.pieces"), "212"],
  ];

  return (
    <svg
      role="img"
      aria-label={t("home.stub.alt")}
      viewBox="0 0 320 220"
      className="h-auto w-full max-w-xs"
    >
      <rect x="2" y="2" width="316" height="216" rx="10" fill="#ffffff" stroke="#d1d5db" strokeWidth="2" />
      <rect x="2" y="2" width="316" height="38" rx="10" fill="var(--color-accent-soft)" />
      <rect x="2" y="30" width="316" height="10" fill="var(--color-accent-soft)" />
      <text x="16" y="27" fontSize="14" fontWeight="700" fill="var(--color-accent)">
        {t("stub.title")}
      </text>
      <text x="16" y="60" fontSize="11" fill="#6b7280">
        {t("stub.period")}: 09/01 – 09/07
      </text>
      <line x1="16" y1="70" x2="304" y2="70" stroke="#e5e7eb" />
      {rows.map(([label, value], i) => (
        <g key={label}>
          <text x="16" y={92 + i * 24} fontSize="13" fill="#374151">
            {label}
          </text>
          <text x="304" y={92 + i * 24} fontSize="13" fill="#111827" textAnchor="end">
            {value}
          </text>
        </g>
      ))}
      <line x1="16" y1="160" x2="304" y2="160" stroke="#e5e7eb" />
      <text x="16" y="182" fontSize="13" fontWeight="600" fill="#374151">
        {t("stub.gross")}
      </text>
      <text x="304" y="182" fontSize="13" fontWeight="600" fill="#111827" textAnchor="end">
        $759.00
      </text>
      <text x="16" y="203" fontSize="13" fontWeight="600" fill="#374151">
        {t("stub.net")}
      </text>
      <text x="304" y="203" fontSize="13" fontWeight="600" fill="#111827" textAnchor="end">
        $641.20
      </text>
    </svg>
  );
}
