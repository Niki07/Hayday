// Where each rule comes from: official law links and plain-language notes. Metadata only (handoff 08).
// Pure TypeScript like the rest of src/lib/rules: no React, no network. Change no amounts here; amounts live in
// checks/*.ts and rates.ts.
//
// Every URL below was opened on 2026-10-24 (D-047):
//  - dir.ca.gov pages and the Wage Order 14 PDF: HTTP 200 with curl.
//  - leginfo.legislature.ca.gov sits behind a Cloudflare browser challenge, so curl always gets 403. Each section was
//    opened in a real browser instead and showed the right statute text. Section 226.7 has two versions on leginfo,
//    so its link lands on leginfo's version picker (pick the newest).

import type { Lang } from "../i18n";

export type Bilingual = { en: string; es: string };

export type RuleSource = {
  id: string;
  title: Bilingual;
  /** Short citation shown to the worker. Same wording the check emits (unpaid-hours emits both variants). */
  citation: string;
  /** Official text of the law the citation points to. */
  url: string;
  /** Extra official pages for the same rule. */
  also?: { label: Bilingual; url: string }[];
  /** ISO date the current rate or version took effect. Only where verified (rates.ts). */
  effective?: string;
  /** One line from D-024, D-026, D-028 or D-029 on what the rule does not cover yet. */
  notCovered: Bilingual;
};

export const DIR_MINIMUM_WAGE_URL = "https://www.dir.ca.gov/dlse/minimum_wage.htm";
export const WAGE_ORDER_14_URL = "https://www.dir.ca.gov/IWC/IWCArticle14.pdf";
export const DIR_AG_OVERTIME_URL = "https://dir.ca.gov/dlse/Overtime-for-Agricultural-Workers.html";

export const RATE_SOURCE = {
  label: "California Department of Industrial Relations",
  url: DIR_MINIMUM_WAGE_URL,
  verifiedOn: "2026-10-24",
} as const;

function laborCodeUrl(section: string): string {
  return `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=${section}`;
}

const wageOrder14: RuleSource["also"] = [
  {
    label: { en: "Wage Order 14 (farm work)", es: "Orden de Salarios 14 (trabajo agrícola)" },
    url: WAGE_ORDER_14_URL,
  },
];

const agOvertime = {
  label: { en: "State page: overtime for farmworkers", es: "Página del Estado: horas extra para trabajadores agrícolas" },
  url: DIR_AG_OVERTIME_URL,
};

// Same order as RULES in index.ts (a test checks it).
export const RULE_SOURCES: Record<string, RuleSource> = {
  "min-wage": {
    id: "min-wage",
    title: { en: "Minimum wage", es: "Salario mínimo" },
    citation: "Cal. Labor Code §§ 1182.12, 1194",
    url: laborCodeUrl("1182.12"),
    also: [
      {
        label: { en: "State page: minimum wage", es: "Página del Estado: salario mínimo" },
        url: DIR_MINIMUM_WAGE_URL,
      },
    ],
    effective: "2026-01-01",
    notCovered: {
      en: "City or county minimum wages above the state rate are not applied (there are none in the Central Valley counties we list).",
      es: "No se aplican salarios mínimos de ciudades o condados más altos que el del Estado (no hay ninguno en los condados del Valle Central que incluimos).",
    },
  },
  "daily-ot": {
    id: "daily-ot",
    title: { en: "Overtime after 8 hours in a day", es: "Horas extra después de 8 horas al día" },
    citation: "Cal. Labor Code § 857 et seq. (AB 1066); Wage Order 14",
    url: laborCodeUrl("857"),
    also: [...wageOrder14, agOvertime],
    effective: "2025-01-01",
    notCovered: {
      en: "Work on a seventh day in a row, split shifts and reporting-time pay are not covered. We do not check the size of the employer.",
      es: "No cubrimos el trabajo del séptimo día seguido, los turnos divididos ni el pago por presentarse a trabajar. No revisamos el tamaño del empleador.",
    },
  },
  "weekly-ot": {
    id: "weekly-ot",
    title: { en: "Overtime after 40 hours in a week", es: "Horas extra después de 40 horas a la semana" },
    citation: "Cal. Labor Code § 857 et seq. (AB 1066); Wage Order 14",
    url: laborCodeUrl("857"),
    also: [...wageOrder14, agOvertime],
    effective: "2025-01-01",
    notCovered: {
      en: "Only the first 8 hours of each day count toward the 40-hour week. We do not check the size of the employer (small employers had a slower start in 2024).",
      es: "Solo las primeras 8 horas de cada día cuentan para las 40 horas de la semana. No revisamos el tamaño del empleador (los empleadores pequeños empezaron más despacio en 2024).",
    },
  },
  "piece-rest": {
    id: "piece-rest",
    title: { en: "Paid rest breaks for piece-rate work", es: "Descansos pagados en el trabajo a destajo" },
    citation: "Cal. Labor Code § 226.2",
    url: laborCodeUrl("226.2"),
    notCovered: {
      en: "Rest-break time is not taken out of the hours when we work out your average hourly pay, so the amount is kept on the low side.",
      es: "No quitamos el tiempo de descanso de las horas al calcular su pago promedio por hora, así que el monto queda del lado bajo.",
    },
  },
  "meal-premium": {
    id: "meal-premium",
    title: { en: "Missed meal breaks", es: "Comidas no tomadas" },
    citation: "Cal. Labor Code §§ 512, 226.7",
    url: laborCodeUrl("512"),
    also: [{ label: { en: "Section 226.7 (pick the newest version)", es: "Sección 226.7 (elija la versión más reciente)" }, url: laborCodeUrl("226.7") }],
    notCovered: {
      en: "Second meal breaks after 10 hours and agreements to skip a meal break are not covered. \"Some days\" counts as one missed day.",
      es: "No cubrimos la segunda comida después de 10 horas ni los acuerdos para omitir una comida. \"Algunos días\" cuenta como un día sin comida.",
    },
  },
  "rest-premium": {
    id: "rest-premium",
    title: { en: "Missed rest breaks", es: "Descansos no tomados" },
    citation: "Cal. Labor Code § 226.7; Wage Order 14",
    url: laborCodeUrl("226.7"),
    also: wageOrder14,
    notCovered: {
      en: "\"Some days\" counts as one missed day, so you may be owed more than we show.",
      es: "\"Algunos días\" cuenta como un día sin descanso, así que es posible que le deban más de lo que mostramos.",
    },
  },
  "unpaid-hours": {
    id: "unpaid-hours",
    title: { en: "Hours worked that are not on the stub", es: "Horas trabajadas que no están en el talón" },
    citation: "Cal. Labor Code §§ 1194, 226.2",
    url: laborCodeUrl("1194"),
    also: [{ label: { en: "Section 226.2", es: "Sección 226.2" }, url: laborCodeUrl("226.2") }],
    notCovered: {
      en: "Differences of less than 15 minutes are ignored.",
      es: "No se toman en cuenta diferencias de menos de 15 minutos.",
    },
  },
  "math-mismatch": {
    id: "math-mismatch",
    title: { en: "Pay stub adds up", es: "Las cuentas del talón cuadran" },
    citation: "Cal. Labor Code § 226(a)",
    url: laborCodeUrl("226"),
    notCovered: {
      en: "Differences of less than $1.00 are ignored, and only amounts you were underpaid count as owed.",
      es: "No se toman en cuenta diferencias de menos de $1.00, y solo cuentan como adeudados los pagos de menos.",
    },
  },
  "stub-incomplete": {
    id: "stub-incomplete",
    title: { en: "Pay stub has all required information", es: "El talón tiene todos los datos requeridos" },
    citation: "Cal. Labor Code § 226(a)",
    url: laborCodeUrl("226"),
    notCovered: {
      en: "The penalty for an incomplete stub (§ 226(e)) is not calculated, so this check adds $0. Your name on the stub is not checked.",
      es: "No calculamos la multa por un talón incompleto (§ 226(e)), así que esta revisión suma $0. No revisamos su nombre en el talón.",
    },
  },
};

/** Official link for a citation string a check emits. Links the first section in lists like "§§ 1194, 226.2". */
export function citationUrl(citation: string): string | undefined {
  const section = citation.match(/§§?\s*(\d+(?:\.\d+)?)/);
  if (section) return laborCodeUrl(section[1]);
  if (/wage order 14/i.test(citation)) return WAGE_ORDER_14_URL;
  return undefined;
}

/** "2026-10-24" -> "October 24, 2026" / "24 de octubre de 2026". */
export function formatLongDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
