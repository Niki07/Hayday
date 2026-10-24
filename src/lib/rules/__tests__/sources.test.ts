import { describe, expect, it } from "vitest";
import { RULES, checkPayStub } from "../index";
import { RULE_SOURCES, citationUrl } from "../sources";
import { samples } from "../../fixtures/samples";

describe("rule sources", () => {
  it("has one entry per rule, in RULES order", () => {
    expect(Object.keys(RULE_SOURCES)).toEqual(RULES.map((r) => r.id));
  });

  it("links the first section of each citation format", () => {
    const lab = (n: string) =>
      `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=${n}`;
    expect(citationUrl("Cal. Labor Code § 226(a)")).toBe(lab("226"));
    expect(citationUrl("Cal. Labor Code § 226.2")).toBe(lab("226.2"));
    expect(citationUrl("Cal. Labor Code §§ 1194, 226.2")).toBe(lab("1194"));
    expect(citationUrl("Cal. Labor Code §§ 512, 226.7")).toBe(lab("512"));
    expect(citationUrl("Cal. Labor Code § 857 et seq. (AB 1066); Wage Order 14")).toBe(lab("857"));
    expect(citationUrl("Wage Order 14")).toContain("IWCArticle14");
    expect(citationUrl("Something else")).toBeUndefined();
  });

  it("maps every citation the sample stubs produce", () => {
    for (const sample of samples) {
      for (const f of checkPayStub(sample.stub, sample.answers).findings) {
        expect(citationUrl(f.citation), f.citation).toBeDefined();
      }
    }
  });

  it("each finding's citation links to the same law as its rule's table entry", () => {
    for (const sample of samples) {
      for (const f of checkPayStub(sample.stub, sample.answers).findings) {
        expect(RULE_SOURCES[f.id], f.id).toBeDefined();
        expect(citationUrl(f.citation), f.id).toBe(RULE_SOURCES[f.id].url);
      }
    }
    for (const source of Object.values(RULE_SOURCES)) {
      expect(citationUrl(source.citation), source.id).toBe(source.url);
    }
  });
});
