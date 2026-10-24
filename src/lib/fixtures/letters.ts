// Claim letter fixture (handoff 03).
// Deterministic template letter built from the same input the AI gets. Used in DEMO_MODE and as the
// fallback when the AI letter fails validation, so the amounts always match the rules engine (D-007).

import type { CheckResult, PayStub, WorkerAnswers } from "@/lib/types";

export type ClaimLetterInput = {
  stub: PayStub;
  answers: WorkerAnswers;
  result: CheckResult;
  workerName?: string;
};

export type ClaimLetter = { en: string; es: string };

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string | undefined, locale: "en-US" | "es-US"): string | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export function buildTemplateLetter(input: ClaimLetterInput, today: Date = new Date()): ClaimLetter {
  const { stub, result } = input;
  const worker = input.workerName?.trim() || stub.employeeName || "";
  const todayIso = today.toISOString().slice(0, 10);
  const total = formatUsd(result.totalOwed);

  const periodEn =
    stub.periodStart && stub.periodEnd
      ? `the pay period ${formatDate(stub.periodStart, "en-US")} to ${formatDate(stub.periodEnd, "en-US")}`
      : "the pay period shown on the attached pay stub";
  const periodEs =
    stub.periodStart && stub.periodEnd
      ? `el periodo de pago del ${formatDate(stub.periodStart, "es-US")} al ${formatDate(stub.periodEnd, "es-US")}`
      : "el periodo de pago que aparece en el talón de pago adjunto";

  const itemsEn = result.findings.map((f, i) => {
    const amount = f.amount > 0 ? ` Amount owed: ${formatUsd(f.amount)}.` : "";
    return `${i + 1}. ${f.title.en} (${f.citation}).${amount}\n   ${f.explanation.en}`;
  });
  const itemsEs = result.findings.map((f, i) => {
    const amount = f.amount > 0 ? ` Cantidad debida: ${formatUsd(f.amount)}.` : "";
    return `${i + 1}. ${f.title.es} (${f.citation}).${amount}\n   ${f.explanation.es}`;
  });

  const en = [
    formatDate(todayIso, "en-US"),
    "",
    `To: ${stub.employerName || "[Employer name]"}`,
    "",
    "Re: Request for payment of unpaid wages",
    "",
    "To whom it may concern:",
    "",
    `I worked for you during ${periodEn}. After reviewing my pay stub against California wage law, I believe I was not paid everything I am owed. The issues are listed below:`,
    "",
    ...itemsEn,
    "",
    `Total estimated amount owed: ${total}.`,
    "",
    `I respectfully request that you pay me ${total} and correct these issues on future pay stubs. This letter and the attached pay stub may be submitted with a wage claim to the California Labor Commissioner's Office.`,
    "",
    "Sincerely,",
    "",
    worker || "[Your name]",
  ].join("\n");

  const es = [
    formatDate(todayIso, "es-US"),
    "",
    `Para: ${stub.employerName || "[Nombre del empleador]"}`,
    "",
    "Asunto: Solicitud de pago de salarios no pagados",
    "",
    "A quien corresponda:",
    "",
    `Trabajé para ustedes durante ${periodEs}. Después de revisar mi talón de pago según la ley de salarios de California, creo que no me pagaron todo lo que me deben. Los problemas son los siguientes:`,
    "",
    ...itemsEs,
    "",
    `Cantidad total estimada que se me debe: ${total}.`,
    "",
    `Les pido respetuosamente que me paguen ${total} y que corrijan estos problemas en los próximos talones de pago. Esta carta y el talón de pago adjunto pueden presentarse con un reclamo de salarios ante la Oficina del Comisionado Laboral de California.`,
    "",
    "Atentamente,",
    "",
    worker || "[Su nombre]",
  ].join("\n");

  return { en, es };
}
