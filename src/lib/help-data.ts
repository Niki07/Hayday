import type { TKey } from "./i18n";

// Legal aid by county. Verified 2026-10-24 against each organization's own site:
//  - crla.org/locations lists offices in Fresno, Delano, Lamont, Madera, Modesto,
//    Stockton and Tulare; crla.org lists Employment as a help area.
//  - centralcallegal.org lists offices in Fresno, Merced and Visalia.
//  - dir.ca.gov/dlse/HowToFileWageClaim.htm is the Labor Commissioner claim page.
// No phone numbers on purpose: they change and could not all be verified.
const CRLA = {
  nameKey: "help.crla.name",
  descKey: "help.crla.desc",
  url: "https://crla.org/locations",
} as const;
const CCLS = {
  nameKey: "help.ccls.name",
  descKey: "help.ccls.desc",
  url: "https://centralcallegal.org",
} as const;

export type HelpEntry = {
  nameKey: TKey;
  descKey: TKey;
  /** Missing for the statewide entries, which have no single office. */
  officeKey?: TKey;
  url: string;
};

export type County = { id: string; nameKey: TKey; nearby?: boolean; entries: HelpEntry[] };

export const counties: County[] = [
  {
    id: "fresno",
    nameKey: "county.fresno",
    entries: [
      { ...CRLA, officeKey: "help.office.fresno" },
      { ...CCLS, officeKey: "help.office.fresno" },
    ],
  },
  {
    id: "kern",
    nameKey: "county.kern",
    entries: [{ ...CRLA, officeKey: "help.office.delano" }],
  },
  {
    id: "tulare",
    nameKey: "county.tulare",
    entries: [
      { ...CRLA, officeKey: "help.office.tulare" },
      { ...CCLS, officeKey: "help.office.visalia" },
    ],
  },
  {
    // No Kings County office could be verified, so show the nearest ones (Tulare County).
    id: "kings",
    nameKey: "county.kings",
    nearby: true,
    entries: [
      { ...CRLA, officeKey: "help.office.tulare" },
      { ...CCLS, officeKey: "help.office.visalia" },
    ],
  },
  {
    id: "madera",
    nameKey: "county.madera",
    entries: [{ ...CRLA, officeKey: "help.office.madera" }],
  },
  {
    id: "merced",
    nameKey: "county.merced",
    entries: [{ ...CCLS, officeKey: "help.office.merced" }],
  },
  {
    id: "stanislaus",
    nameKey: "county.stanislaus",
    entries: [{ ...CRLA, officeKey: "help.office.modesto" }],
  },
  {
    id: "sanjoaquin",
    nameKey: "county.sanjoaquin",
    entries: [{ ...CRLA, officeKey: "help.office.stockton" }],
  },
];

/** The two organizations that serve the whole Central Valley, for any county we have no offices for. */
export const statewideHelp: HelpEntry[] = [CRLA, CCLS];

/**
 * Entries for the county stored in WorkerAnswers.county ("Fresno", "San Joaquin", "Other"). Also accepts the
 * ids above. Returns undefined for "Other" and anything unknown.
 */
export function getCountyHelp(countyId: string | undefined): County | undefined {
  const key = (countyId ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+county$/, "")
    .replace(/\s+/g, "");
  return counties.find((c) => c.id === key);
}
