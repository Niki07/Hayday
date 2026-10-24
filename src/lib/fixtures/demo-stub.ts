// DEMO_MODE extraction fixture (handoff 03).
// Local stand-in for `samples[0].stub` from `src/lib/fixtures/samples.ts`, which handoff 02 owns.
// TODO: once samples.ts lands, `src/lib/llm.ts` should return `samples[0].stub` and this file can go (see ENGINEERING.md).

import type { PayStub } from "@/lib/types";

export const demoStub: PayStub = {
  employerName: "Sunfield Vineyards LLC",
  employeeName: "Maria Hernandez",
  periodStart: "2026-09-07",
  periodEnd: "2026-09-13",
  payType: "piece",
  hoursWorked: 48,
  pieceUnits: 412,
  pieceRate: 1.1,
  pieceUnitName: "tray",
  grossPay: 453.2,
  netPay: 398.85,
  deductions: [
    { label: "Federal income tax", amount: 18.5 },
    { label: "Social Security", amount: 28.1 },
    { label: "Medicare", amount: 6.57 },
    { label: "CA SDI", amount: 1.18 },
  ],
  rawText:
    "SUNFIELD VINEYARDS LLC\nEarnings Statement\nEmployee: Maria Hernandez\nPay period: 09/07/2026 - 09/13/2026\nHours worked: 48.00\nPiece work: 412 trays @ $1.10 = $453.20\nGross pay: $453.20\nFederal income tax: $18.50\nSocial Security: $28.10\nMedicare: $6.57\nCA SDI: $1.18\nNet pay: $398.85",
  confidence: 0.93,
};
