// Minimum wage tables for the rules engine. Every value below was checked online on 2026-10-24
// (handoff 02). Do not add a number here without a source URL and a verification date.

export type RateEntry = { effective: string; rate: number; source: string };

// California statewide minimum wage. Since 2023 the rate is the same for every employer size.
// Source: https://www.dir.ca.gov/dlse/faq_minimumwage.htm (table "Minimum Wage Rates", verified 2026-10-24)
// 2026 also confirmed at https://www.dir.ca.gov/dlse/minimum_wage.htm ("$16.90/hour for all employers").
// The 2027 rate is not published yet (CPI-W adjustment, announced by August each year).
export const STATE_MINIMUM_WAGE: RateEntry[] = [
  { effective: "2023-01-01", rate: 15.5, source: "https://www.dir.ca.gov/dlse/faq_minimumwage.htm" },
  { effective: "2024-01-01", rate: 16.0, source: "https://www.dir.ca.gov/dlse/faq_minimumwage.htm" },
  { effective: "2025-01-01", rate: 16.5, source: "https://www.dir.ca.gov/dlse/faq_minimumwage.htm" },
  { effective: "2026-01-01", rate: 16.9, source: "https://www.dir.ca.gov/dlse/minimum_wage.htm" },
];

export type LocalRateEntry = RateEntry & { county: string; city?: string };

// Local minimum wage ordinances in Central Valley cities and counties.
// Intentionally empty. DIR links to the UC Berkeley Labor Center inventory as its list of local rates:
// https://laborcenter.berkeley.edu/inventory-of-us-city-and-county-minimum-wage-ordinances/
// Checked 2026-10-24: its 40 California localities are all in the Bay Area, Los Angeles area, San Diego
// and Sonoma County. None is in Kern, Tulare, Kings, Fresno, Madera, Merced, Stanislaus, San Joaquin,
// Sacramento, Yolo, Sutter, Yuba, Butte, Glenn, Colusa, Tehama or Shasta County, so the state rate applies.
// To add one: { county, city?, effective, rate, source } with the city's official ordinance URL.
export const LOCAL_MINIMUM_WAGE: LocalRateEntry[] = [];

// Farmworker overtime (AB 1066, Labor Code § 857 et seq.). Fully phased in for employers with 26+ employees on
// 2022-01-01 and for employers with 25 or fewer on 2025-01-01: 1.5x after 8 hours a day or 40 a week,
// 2x after 12 hours a day.
// Source: https://dir.ca.gov/dlse/Overtime-for-Agricultural-Workers.html (verified 2026-10-24)
export const DAILY_OT_AFTER = 8;
export const DAILY_DOUBLE_AFTER = 12;
export const WEEKLY_OT_AFTER = 40;

function normalize(place: string | undefined): string {
  return (place ?? "").trim().toLowerCase().replace(/\s+county$/, "");
}

function rateOn(entries: RateEntry[], date: string): RateEntry | undefined {
  // Latest entry whose effective date is on or before `date`. ISO dates compare as strings.
  return [...entries]
    .sort((a, b) => a.effective.localeCompare(b.effective))
    .filter((e) => e.effective <= date)
    .pop();
}

export function getStateMinimumWage(date?: string): RateEntry {
  const sorted = [...STATE_MINIMUM_WAGE].sort((a, b) => a.effective.localeCompare(b.effective));
  // No date on the stub: use the newest rate. A date before the table starts: use the oldest rate.
  if (!date) return sorted[sorted.length - 1];
  return rateOn(sorted, date) ?? sorted[0];
}

export function getLocalMinimumWage(date: string | undefined, county: string, city?: string): LocalRateEntry | undefined {
  const c = normalize(county);
  const ci = normalize(city);
  const matches = LOCAL_MINIMUM_WAGE.filter(
    (e) => normalize(e.county) === c && (e.city === undefined || normalize(e.city) === ci),
  );
  if (matches.length === 0) return undefined;
  const effectiveDate = date ?? "9999-12-31";
  return rateOn(matches, effectiveDate) as LocalRateEntry | undefined;
}

/** Highest applicable minimum wage per hour for a date (ISO) and place. */
export function getMinimumWage(date: string, county: string, city?: string): number {
  const state = getStateMinimumWage(date || undefined).rate;
  const local = getLocalMinimumWage(date || undefined, county, city)?.rate ?? 0;
  return Math.max(state, local);
}
