"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "en" | "es";

const en = {
  // Header, footer, toggle
  "nav.home": "Hayday home",
  "lang.label": "Language",
  "lang.en": "EN",
  "lang.es": "ES",
  "footer.privacy": "We do not save your photo, your name or your pay stub.",
  "footer.help": "Get free help",
  "footer.estimate": "Hayday gives estimates, not legal advice.",

  // Home
  "home.headline": "Make every payday a Hayday.",
  "home.subline": "Take a photo of your pay stub. We check if you were paid correctly.",
  "home.cta": "Check my pay stub",
  "home.sample": "Try a sample",
  "home.checks.title": "What we check",
  "home.checks.1": "Minimum wage and overtime",
  "home.checks.2": "Paid rest breaks for piece-rate work",
  "home.checks.3": "Missing hours or missing information on the stub",
  "home.stub.caption":
    "This is a pay stub. It comes with your check or in your payroll app.",
  "home.stub.alt": "Illustration of a pay stub with hours, rate and pay listed",
  "home.privacy.title": "Your privacy",
  "home.privacy.body": "We do not save your photo, your name or your pay stub.",

  // Pay stub illustration labels
  "stub.title": "Earnings statement",
  "stub.period": "Pay period",
  "stub.hours": "Hours",
  "stub.rate": "Rate",
  "stub.pieces": "Pieces",
  "stub.gross": "Gross pay",
  "stub.net": "Net pay",

  // Stub pages
  "check.title": "Check my pay stub",
  "review.title": "Review your pay stub",
  "result.title": "Your result",
  "claim.title": "Your claim",
  "stub.coming": "This page is coming soon.",

  // Help
  "help.title": "Get free help",
  "help.intro":
    "These groups help farmworkers with pay problems. Their help is free or low cost, and your immigration status does not change your wage rights in California.",
  "help.labor.title": "File a wage claim with the State",
  "help.labor.name": "California Labor Commissioner",
  "help.labor.desc":
    "The state office that handles wage claims. You can file for free, online, by mail or in person.",
  "help.visit": "Visit website",
  "help.nearby":
    "No office in this county that we could verify. These are the nearest offices:",
  "help.crla.name": "California Rural Legal Assistance (CRLA)",
  "help.crla.desc":
    "Nonprofit law firm for people in rural California. Handles employment problems such as unpaid wages.",
  "help.ccls.name": "Central California Legal Services",
  "help.ccls.desc":
    "Free civil legal help for low-income people. Ask them if they can help with a pay problem.",
  "help.disclaimer":
    "Check each group's website for current hours and what they can help with. Offices and services can change.",
  "county.fresno": "Fresno County",
  "county.kern": "Kern County",
  "county.tulare": "Tulare County",
  "county.kings": "Kings County",
  "county.madera": "Madera County",
  "county.merced": "Merced County",
  "county.stanislaus": "Stanislaus County",
  "county.sanjoaquin": "San Joaquin County",
  "help.office.fresno": "Office in Fresno",
  "help.office.delano": "Offices in Delano and Lamont",
  "help.office.tulare": "Office in Tulare",
  "help.office.visalia": "Office in Visalia",
  "help.office.madera": "Office in Madera",
  "help.office.merced": "Office in Merced",
  "help.office.modesto": "Office in Modesto",
  "help.office.stockton": "Office in Stockton",
} as const;

export type TKey = keyof typeof en;

const es: Record<TKey, string> = {
  "nav.home": "Inicio de Hayday",
  "lang.label": "Idioma",
  "lang.en": "EN",
  "lang.es": "ES",
  "footer.privacy": "No guardamos su foto, su nombre ni su talón de pago.",
  "footer.help": "Obtenga ayuda gratis",
  "footer.estimate": "Hayday da cálculos aproximados, no asesoría legal.",

  "home.headline": "Haga de cada día de pago un Hayday.",
  "home.subline":
    "Tome una foto de su talón de pago. Revisamos si le pagaron lo correcto.",
  "home.cta": "Revisar mi talón de pago",
  "home.sample": "Probar un ejemplo",
  "home.checks.title": "Qué revisamos",
  "home.checks.1": "Salario mínimo y horas extra",
  "home.checks.2": "Descansos pagados en el trabajo a destajo",
  "home.checks.3": "Horas o datos que faltan en el talón",
  "home.stub.caption":
    "Este es un talón de pago. Viene con su cheque o en la aplicación de nómina.",
  "home.stub.alt":
    "Ilustración de un talón de pago con las horas, la tarifa y el pago",
  "home.privacy.title": "Su privacidad",
  "home.privacy.body": "No guardamos su foto, su nombre ni su talón de pago.",

  "stub.title": "Estado de ganancias",
  "stub.period": "Período de pago",
  "stub.hours": "Horas",
  "stub.rate": "Tarifa",
  "stub.pieces": "Piezas",
  "stub.gross": "Pago bruto",
  "stub.net": "Pago neto",

  "check.title": "Revisar mi talón de pago",
  "review.title": "Revise su talón de pago",
  "result.title": "Su resultado",
  "claim.title": "Su reclamo",
  "stub.coming": "Esta página estará disponible pronto.",

  "help.title": "Obtenga ayuda gratis",
  "help.intro":
    "Estos grupos ayudan a los trabajadores del campo con problemas de pago. Su ayuda es gratuita o de bajo costo, y su estatus migratorio no cambia sus derechos de pago en California.",
  "help.labor.title": "Presente un reclamo de salarios ante el Estado",
  "help.labor.name": "Comisionado Laboral de California",
  "help.labor.desc":
    "La oficina estatal que atiende los reclamos de salarios. Puede presentar su reclamo gratis, en línea, por correo o en persona.",
  "help.visit": "Visitar el sitio web",
  "help.nearby":
    "No pudimos verificar una oficina en este condado. Estas son las más cercanas:",
  "help.crla.name": "California Rural Legal Assistance (CRLA)",
  "help.crla.desc":
    "Bufete sin fines de lucro para personas de zonas rurales de California. Atiende problemas de trabajo, como salarios sin pagar.",
  "help.ccls.name": "Central California Legal Services",
  "help.ccls.desc":
    "Ayuda legal civil gratuita para personas de bajos ingresos. Pregunte si pueden ayudarle con un problema de pago.",
  "help.disclaimer":
    "Revise el sitio web de cada grupo para ver los horarios actuales y en qué pueden ayudarle. Las oficinas y los servicios pueden cambiar.",
  "county.fresno": "Condado de Fresno",
  "county.kern": "Condado de Kern",
  "county.tulare": "Condado de Tulare",
  "county.kings": "Condado de Kings",
  "county.madera": "Condado de Madera",
  "county.merced": "Condado de Merced",
  "county.stanislaus": "Condado de Stanislaus",
  "county.sanjoaquin": "Condado de San Joaquin",
  "help.office.fresno": "Oficina en Fresno",
  "help.office.delano": "Oficinas en Delano y Lamont",
  "help.office.tulare": "Oficina en Tulare",
  "help.office.visalia": "Oficina en Visalia",
  "help.office.madera": "Oficina en Madera",
  "help.office.merced": "Oficina en Merced",
  "help.office.modesto": "Oficina en Modesto",
  "help.office.stockton": "Oficina en Stockton",
};

export const dictionary: Record<Lang, Record<TKey, string>> = { en, es };

const STORAGE_KEY = "hayday-lang";

// Tiny external store so the language is "en" on the server and during
// hydration, then switches to the saved choice without a mismatch.
let current: Lang = "en";
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "es") current = saved;
  } catch {
    // localStorage can be blocked; stay on English
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Lang {
  load();
  return current;
}

function getServerSnapshot(): Lang {
  return "en";
}

function setLangStore(next: Lang) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLang = useCallback((l: Lang) => setLangStore(l), []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return createElement(LanguageContext.Provider, { value: { lang, setLang } }, children);
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { lang } = useLanguage();
  return useCallback((key: TKey) => dictionary[lang][key], [lang]);
}
