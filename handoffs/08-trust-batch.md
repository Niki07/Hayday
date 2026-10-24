# Handoff 08 — Make the real law visible (trust batch)

- Model: Sonnet
- Depends on: everything in waves 1–2 (all committed and live)
- Can run in parallel with: nothing else is running
- Estimated time: 90 min

## Goal
A judge or a legal aid worker can see, on every result, exactly which California rules were checked, click through to the law text, read a plain-language page about the rules, and get legal aid offices for their own county without hunting.

## Context
Niki's feedback: "it should be more obvious that we are using real laws and regulations." The rules engine already cites sections (D-024, D-029, D-030) but the citations are plain text buried in cards. Important honesty constraint: California farm labor pay rules are **statewide**; no Central Valley city has a local minimum wage (D-024). The county only routes help. Say so; never imply county-specific wage rules.

## Read first
- CLAUDE.md, ENGINEERING.md (D-007, D-024, D-029, D-030, D-045, D-046), SETUP.md, AGENTS.md
- `src/lib/rules/index.ts` (`RULES`, `checkPayStub`, `checkedRules` is the list of rule ids), `src/lib/rules/rates.ts` (rates with source URLs), `src/lib/rules/checks/*.ts` (each finding's `citation` string)
- `src/app/check/result/page.tsx`, `src/components/check/` (FindingCard lives here or in the result page), `src/app/help/page.tsx` (county data), `src/app/page.tsx`, `src/components/SiteFooter.tsx`, `src/app/terms/page.tsx` (page style to copy), `src/lib/i18n.ts`

## Deliverable
1. **`src/lib/rules/sources.ts`**: one metadata table keyed by rule id with: `title` (en/es, plain), `citation` (short string, must match what the check files emit), `url` (official text: Labor Code sections at `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=226.2` pattern; Wage Order 14 at the DIR site; minimum wage at the DIR minimum wage page), `effective` (date the current version/rate took effect, from `rates.ts` or the DIR page), `notCovered` (en/es, one line from D-029's simplifications). Also `RATE_SOURCE = { label: "California Department of Industrial Relations", url, verifiedOn: "2026-10-24" }`. **Curl every URL and confirm it returns 200 before using it.** Also export `citationUrl(citation: string): string | undefined` that maps the citation strings the checks already emit to URLs (handle "§§ 1194, 226.2" style lists: link the first section).
2. **Result page "Checked against" strip** (`/check/result`): directly under the headline (both the owed state and the green state), a compact section titled "Checked against California law" / Spanish equivalent, listing every id in `result.checkedRules` as `title — citation` with the citation as a link (new tab), followed by one line: "Rates from the California Department of Industrial Relations, verified October 24, 2026" linking to the DIR page. Collapsible on mobile (`<details>` open by default on desktop is fine) so the cards stay first.
3. **Clickable citations on every finding card**: the "Rule: …" line becomes a link via `citationUrl`, new tab, with an external-link glyph. Also on the claim page's printed findings table, keep text only (print).
4. **`/rules` page** "The rules we check": intro paragraph (statewide rules; what the county is used for), then one block per rule in `RULES` order: plain-words title, one-paragraph explanation (reuse or adapt the en/es explanations the checks produce; no legal jargon), citation link, current rate or threshold with effective date where relevant (minimum wage $ by year from `rates.ts`, overtime 8/12/40), and "Not covered yet: …". Footer link "The rules we check" / Spanish. Also link to it from the result strip ("How we check").
5. **Home trust line**: one sentence under the subline on `/`: "Checks your stub against California Labor Code sections 226, 226.2, 226.7, 512, 857 and 1194, and Wage Order 14. Rates verified with the state on October 24, 2026." Spanish too. Small, gray, with "The rules we check" link.
6. **County-based legal aid on the result page**: move the `counties` data and types out of `src/app/help/page.tsx` into `src/lib/help-data.ts` (export `counties`, `getCountyHelp(countyId)`), make the help page import it (no behavior change). On the result page, replace the generic "Find free legal aid" button area with: "Free legal help in {County} County" and the 1–3 entries for `answers.county` (name, office line, website link), then the existing "How to file a wage claim" button. County ids must match what the review page stores in `answers.county` (check `src/app/check/review/page.tsx`); if "Other California county", show the two statewide organizations with no office line.
7. All new strings in English and Spanish in `i18n.ts` (append only; prefixes `rules.`, `trust.`, `result.law.`).

## Done when
- [ ] `/check?sample=1` → result shows the "Checked against" strip with 9 linked citations and the DIR line; the green sample (`correct-stub`) shows it too
- [ ] Every finding card's citation is a working link (open one in the browser and confirm the law page loads)
- [ ] `/rules` renders in both languages, footer links to it, result strip links to it
- [ ] Home page shows the trust line
- [ ] Result page shows Fresno County organizations for the grape sample; "Other California county" shows the statewide ones; `/help` unchanged
- [ ] Every URL in `sources.ts` returned 200 when curled this session
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` all pass
- [ ] Decisions logged in ENGINEERING.md (next free number); Report back filled in

## Constraints
- Do not change rule logic, amounts or tests; `sources.ts` is metadata only. If a citation string in a check does not map cleanly, add the mapping in `citationUrl`, do not edit the check.
- Do not edit package.json or install packages (D-009).
- Keep the result page's order: headline, strip, cards, help, actions.
- The planning session's dev server runs on port 3000 and Next allows one per folder; test against it (read-only) rather than starting another.
- Do not commit.

## Out of scope
- Step indicator, share button, organizer view
- Any county-specific wage rule (none exist here)

## Decisions already made
- D-007 deterministic rules; D-024 statewide rates verified; D-045/D-046 current page layout

## Decisions you may hit (escalate to Fable 5.1)
- A citation string with no official URL: log Open, render text only

## Report back (filled in by the subrunner)
- Status: Done. `npm run lint`, `npx tsc --noEmit`, `npm test` (52 tests) and `npm run build` all pass. Nothing committed.
- What was built:
  - `src/lib/rules/sources.ts`: `RULE_SOURCES` (title, citation, url, extra links, effective, notCovered, en/es), `RATE_SOURCE`, `citationUrl()`, `formatLongDate()`.
  - `src/lib/help-data.ts`: `counties`, `statewideHelp`, `getCountyHelp()`; `/help` imports it and renders the same 8 counties and 11 cards.
  - `src/components/check/LawStrip.tsx` ("Checked against California law", 9 linked citations, DIR rate line, "How we check" link to `/rules`), shown under the headline in both result states; `src/components/ui/ExternalLink.tsx` (new tab, ↗ glyph, screen-reader note).
  - Finding cards: "Rule: …" is a link via `citationUrl`. The printed claim table stays text.
  - `/rules` page (both languages, one block per rule, rate table, thresholds, "Not covered yet"), footer link, home trust line.
  - Result page: "Free legal help in {County}" with the county's organizations, statewide pair for "Other", county-scope note, claim button, "See all legal aid offices".
  - 32 keys per language in `i18n.ts` (prefixes `rules.`, `trust.`, `result.law.`, `footer.rules`), English and Spanish, appended.
  - New test file `src/lib/rules/__tests__/sources.test.ts` (4 tests).
- What was NOT done and why:
  - leginfo URLs could not be confirmed with curl (Cloudflare challenge returns 403 for the whole host). Confirmed in the built-in browser instead: 226, 226.2, 512, 857, 1182.12, 1194 show the right statute. 226.7 opens leginfo's version picker (D-047). The three dir.ca.gov URLs returned 200 with curl.
  - Could not click through a citation to a second tab in the (hidden) browser pane; the link has `target="_blank"` and the exact href loaded when navigated to directly.
  - No per-statute `effective` dates (none verified); only min wage 2026-01-01 and farm overtime 2025-01-01.
  - Not tested on a real phone or in Safari; mobile checked with the 375 px emulation (strip closed, no horizontal scroll).
- Decisions logged: D-047, D-048, D-049
- Open questions for Fable:
  - Is the version-picker landing for § 226.7 acceptable, or should it link to something else (e.g. Wage Order 14 section on rest breaks)?
  - Do you want the home trust line to name § 1182.12 (I added it, D-048) or keep the handoff's original list?
  - For "Other California county" the statewide pair are Central Valley organizations; do you have a better statewide list?
- How to verify: `/check?sample=1`, pick the grape sample, press "Check my pay": strip with 9 links, three linked card citations, "Free legal help in Fresno County". Repeat with the "everything correct" sample (strip open, green). Change county to "Other California county" on the review page for the statewide pair. Open `/rules` (footer link) and `/`.
