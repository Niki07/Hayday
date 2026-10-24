"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import { useT, type TKey } from "@/lib/i18n";

// Verified 2026-10-24 against each organization's own site:
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

type Entry = {
  nameKey: TKey;
  descKey: TKey;
  officeKey: TKey;
  url: string;
};

type County = { id: string; nameKey: TKey; nearby?: boolean; entries: Entry[] };

const counties: County[] = [
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

export default function HelpPage() {
  const t = useT();

  return (
    <PageContainer className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("help.title")}</h1>
        <p className="text-lg leading-7 text-gray-600">{t("help.intro")}</p>
      </section>

      <section>
        <Card className="border-accent/30 bg-accent-soft">
          <h2 className="text-lg font-semibold text-accent">{t("help.labor.title")}</h2>
          <p className="mt-1 font-semibold text-gray-900">{t("help.labor.name")}</p>
          <p className="mt-1 text-gray-700">{t("help.labor.desc")}</p>
          <Button
            href="https://www.dir.ca.gov/dlse/HowToFileWageClaim.htm"
            className="mt-4 w-full"
          >
            {t("help.visit")}
          </Button>
        </Card>
      </section>

      {counties.map((c) => (
        <section key={c.id} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-gray-900">{t(c.nameKey)}</h2>
          {c.nearby && <p className="text-sm text-gray-600">{t("help.nearby")}</p>}
          {c.entries.map((e) => (
            <Card key={`${c.id}-${e.nameKey}`}>
              <h3 className="text-base font-semibold text-gray-900">{t(e.nameKey)}</h3>
              <p className="mt-0.5 text-sm font-medium text-accent">{t(e.officeKey)}</p>
              <p className="mt-1 text-gray-700">{t(e.descKey)}</p>
              <Button href={e.url} variant="secondary" size="md" className="mt-3 w-full">
                {t("help.visit")}
              </Button>
            </Card>
          ))}
        </section>
      ))}

      <p className="text-sm text-gray-600">{t("help.disclaimer")}</p>
    </PageContainer>
  );
}
