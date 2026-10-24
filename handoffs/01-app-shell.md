# Handoff 01 — App shell, i18n, design system, home page, help page

- Model: Sonnet
- Depends on: scaffold (already done)
- Can run in parallel with: 02, 03
- Estimated time: 75 min

## Goal
The site has a layout, navigation, an English/Spanish toggle that works on every page, a small design system, a finished home page and a finished help page. Other pages exist as stubs with headings so routing works.

## Context
This is the frame every other page plugs into. See PLAN.md "Pages" and D-006 in ENGINEERING.md: English default, Spanish toggle, calm professional design with large tap targets. Not a children's app.

## Read first
- CLAUDE.md, ENGINEERING.md (D-004, D-005, D-006), SETUP.md
- PLAN.md (Pages table, Demo script)
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

## Deliverable
1. `src/lib/i18n.ts`: a typed dictionary `{ en: {...}, es: {...} }` with every string used in this task, a `LanguageProvider` React context defaulting to `"en"`, a `useT()` hook returning `t(key)`, and persistence of the choice in `localStorage` (wrapped in try/catch).
2. `src/components/LanguageToggle.tsx`: a two-option segmented control "EN | ES" in the header.
3. `src/components/ui/`: `Button` (variants: primary, secondary, ghost; sizes: lg default, min height 52px), `Card`, `PageContainer` (max width 640px, 16px side padding). Tailwind only, no component library install.
4. Design tokens in `globals.css`: one accent color (deep green or deep blue, pick one and log it), neutral grays, white background, system font stack with Inter if available via `next/font`. Dark mode is out of scope.
5. `src/app/layout.tsx`: header with wordmark "Hayday" (link to `/`) and the toggle; footer with the privacy line and a link to `/help`.
6. `src/app/page.tsx` (home): headline **"Make every payday a Hayday."** (capital M and H, exactly) with the subline "Take a photo of your pay stub. We check if you were paid correctly." One primary button **Check my pay stub** → `/check`. One secondary link **Try a sample** → `/check?sample=1`. A "What we check" section with three short lines (minimum wage and overtime; paid rest breaks for piece-rate work; missing hours or missing information on the stub). A small illustration or framed placeholder image of a pay stub with the caption "This is a pay stub. It comes with your check or in your payroll app." The privacy promise: "We do not save your photo, your name or your pay stub."
7. `src/app/help/page.tsx`: list of free legal aid and farmworker organizations serving the Central Valley, grouped by county (Fresno, Kern, Tulare, Kings, Madera, Merced, Stanislaus, San Joaquin). Organization name, one-line description, website link. **Verify each organization exists via a web search. Do not invent phone numbers; omit phone numbers entirely if unsure.** Include the California Labor Commissioner's wage claim page link.
8. Stub pages so routes resolve: `src/app/check/page.tsx`, `src/app/check/review/page.tsx`, `src/app/check/result/page.tsx`, `src/app/check/claim/page.tsx`, each rendering just a heading. Handoffs 04 and 05 replace them.
9. Every visible string in both languages. Spanish should be natural, not machine-literal.

## Done when
- [x] `npm run dev` opens the home page with header, toggle, footer; toggle switches all text to Spanish and the choice survives a reload
- [x] All routes in PLAN.md render without errors
- [x] Buttons are at least 52px tall on mobile and the page has no horizontal scroll at 375px width
- [x] `npm run lint` passes
- [x] Decisions (accent color, font, any library) logged in ENGINEERING.md
- [x] Report back section below is filled in

## Constraints
- Do not edit package.json or install packages (D-009). Needed dependency → Open item in your report.
- Tailwind only. No shadcn or UI library install (saves time and avoids CLI prompts).
- No images from the internet. Use an inline SVG or CSS-framed placeholder for the pay stub picture.
- Do not touch `src/lib/rules/`, `src/lib/llm.ts`, or `src/app/api/` (other subrunners own them).

## Out of scope
- Upload, review, result, claim page content (04, 05)
- Any API call
- Dark mode, animations beyond simple transitions

## Decisions already made (do not reopen)
- D-005: Next.js + Tailwind, no DB
- D-006: English default, Spanish toggle, calm design, big tap targets

## Decisions you may hit (escalate to Fable 5.1)
- Whether to add a third language (do not; log as Open if asked)
- Any dependency beyond `next/font`

## Report back (filled in by the subrunner)
- Status: Done. All "Done when" boxes checked. Nothing committed (per instructions).
- What was built: `src/lib/i18n.ts` (en/es dictionary, `LanguageProvider`, `useT`, `useLanguage`), `LanguageToggle`, `SiteHeader`, `SiteFooter`, `PayStubIllustration`, `StubPage`, `ui/Button` (primary/secondary/ghost, lg = 52px min, md = 44px; accepts `href` for internal or external links), `ui/Card`, `ui/PageContainer`, design tokens in `globals.css`, layout with header and footer, home page, `/help` page, stubs for `/check`, `/check/review`, `/check/result`, `/check/claim`.
- What was NOT done and why: No phone numbers on `/help` (could not verify; handoff says omit). Kern, Kings, Merced and San Joaquin have only one or two organizations, or nearest offices for Kings; no more could be verified from official sites in the time. "Try a sample" links to `/check?sample=1`, which handoff 04 must handle. Dark mode removed as specified.
- Decisions logged: D-010 to D-014
- Open questions for Fable: (1) Add more Central Valley groups to `/help` after verifying them (Kern especially)? (2) Confirm the Spanish tone (formal "usted"). (3) The first Spanish page load flashes English for a moment (D-011); acceptable for the demo?
- How to verify: `npm run dev`, open http://localhost:3000 at 375px wide. Home shows the headline "Make every payday a Hayday."; tap ES, the page turns Spanish and stays Spanish after a reload. Buttons are 52px tall (header toggle and footer link 44px), page width equals viewport (no horizontal scroll). `/help` and the four `/check*` routes return 200. `npm run lint` passes. Note: the dev server on port 3000 started by the planning session served stale CSS until `globals.css` content changed; if colors look wrong, restart it.
