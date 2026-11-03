# Migration log: Chakra UI → Tailwind v4 + Radix/shadcn

Tracks progress, decisions, and deviations from
`docs/tailwind-shadcn-migration-plan.md` as the work happens. Append entries in
date order; don't rewrite history — if a decision changes, add a new entry
noting what changed and why.

---

## 2026-09-13 — Plan drafted, handed off

- Wrote `docs/tailwind-shadcn-migration-plan.md` after an inventory pass of the
  current Chakra UI v3 codebase (16 pages, ~13 shared components, 24 files
  importing `@chakra-ui/react` directly, 370-line `app/globals.css` with
  hand-rolled animations).
- Estimated 1–2 weeks of effort for one engineer; flagged visual QA (no
  automated visual regression coverage exists) as the main risk, not the
  mechanical prop translation.
- Decision: do this on a feature branch with PR review, not direct pushes to
  `main` — this repo auto-deploys to Vercel on every push to `main`.
- Open questions for whoever picks this up:
  - Is Framer Motion being kept for animation, or fully replaced by CSS/Tailwind
    transitions? (Plan defaults to "decide during token/setup phase.")
  - What are `public/assets/tailwind.css` / `tailwind-lite.css`? Confirm these
    are unrelated legacy static assets before reusing or deleting them.
  - Does `app/providers.js` have any non-default `extendTheme` customization
    that needs an explicit Tailwind-token equivalent? (Not checked in detail
    during planning — verify first.)
- Status: **not started**. Handed to Codex to build.

<!-- Next entry: append below, most-recent last -->

## 2026-09-13 — Restarted as visual rebuild, not bridge conversion

- Rejected the first Chakra-prop bridge approach after visual review: it produced
  a green build but did not preserve fonts, button sizing, card proportions, or
  package-page details closely enough.
- Restored the original Chakra baseline and reinstalled dependencies so
  `sdrc.in` and local Chakra output can serve as visual references.
- Captured live baseline screenshots in `/tmp/sdrc-visual-baseline/` for home
  mobile/desktop, packages desktop, and tests desktop.
- Added Tailwind v4 tooling alongside Chakra using `tailwindcss/theme.css` and
  `tailwindcss/utilities.css` only, intentionally avoiding Tailwind preflight
  during the transition so still-Chakra pages do not shift underneath us.
- Added explicit local Tailwind primitives (`Button`, `Card`, `Input`,
  `Textarea`, `TwContainer`, `Chip`) instead of a generic Chakra prop shim.
- Rebuilt `SiteHeader` and `SiteFooter` by hand. Header decisions:
  - `Book A Test` is now a regular pill with no `NEW` badge.
  - `SDRC Health App` carries the `NEW` badge on desktop and mobile.
  - Mobile header must not show desktop CTAs or create horizontal overflow.
- Acceptance rule added: every rebuilt surface must pass mobile screenshots
  against the live site at ~390px and desktop checks at tighter widths such as
  1280px, with no horizontal overflow or clipped badges.
- Performance rule added: final migration must not increase route JS/CSS
  materially; Chakra remains only during transition and should be removed once
  page bodies are rebuilt.

## 2026-09-13 — Packages route rebuilt

- Rebuilt `/packages` hero and `components/site/PackagesExplorer.js` with
  explicit Tailwind components; the route no longer imports Chakra directly.
- Preserved package data refresh, search, package anchor chips, compare
  selection, add-to-cart, booking links, WhatsApp enquiry, package detail modal,
  share/download image export, comparison modal, and toast behavior.
- Updated the header CTA policy from review feedback: `Book A Test` is regular,
  while `SDRC Health App` owns the `NEW` badge.
- Captured local screenshots:
  - `/tmp/sdrc-visual-baseline/local-packages-desktop-tw.png`
  - `/tmp/sdrc-visual-baseline/local-packages-mobile-tw.png`
- Verification: `npm run build` passes. `/packages` First Load JS is now
  `127 kB` in the build output, down from the prior transition checkpoint
  around `146 kB`.

## 2026-09-13 — Tests route and cart request flow rebuilt

- Rebuilt `/tests` around the new Tailwind/labit-style primitives:
  functional hero, mobile package/test rails, desktop test/package finder,
  package include popovers, floating cart button, warning toast, and cart section.
- Fixed the responsive-button issue caught in mobile screenshots: local `Button`
  always renders `inline-flex`, so responsive visibility must live on wrappers
  instead of `hidden md:*` classes on the button itself.
- Converted shared booking components used by `/tests`, `/cart`, and
  `/home-visit`:
  - `components/cart/CartRequestPanel.js`
  - `components/booking/VisitDateTimeSelector.js`
- Preserved cart persistence, request validation, slot loading, visit-type
  toggle behavior, duplicate/package overlap warnings, analytics events, and
  WhatsApp/report links.
- Captured local screenshots:
  - `/tmp/sdrc-visual-baseline/local-tests-desktop-tw-2.png`
  - `/tmp/sdrc-visual-baseline/local-tests-mobile-tw-3.png`
- Local caveat: `/api/tests` returns `500` with `TypeError: fetch failed` in this
  sandbox because Supabase is unreachable here, so screenshots show the tests
  loading state. This is environmental; the production build compiles the route.
- Verification: `npm run build` passes. `/tests` First Load JS is now `125 kB`,
  down from `145 kB` before converting the shared cart/date selector path.

## 2026-09-13 — Cart route shell rebuilt

- Rebuilt `/cart` page shell with `TwContainer`, `Card`, and local `Button`.
- The route now uses the converted `CartRequestPanel` end-to-end and no longer
  imports Chakra directly.
- Verification: `npm run build` passes. `/cart` First Load JS is now `116 kB`.

## 2026-09-13 — Home visit route rebuilt

- Rebuilt `/home-visit` page shell and booking form with local Tailwind
  primitives while keeping structured data, prescription upload, cart-item
  handoff, slot loading, validation, analytics events, and WhatsApp action.
- Captured local screenshots:
  - `/tmp/sdrc-visual-baseline/local-home-visit-desktop-tw.png`
  - `/tmp/sdrc-visual-baseline/local-home-visit-mobile-tw.png`
- Local caveat: quickbook slot loading remains in a loading/error path in this
  sandbox because the backend network calls are unavailable locally.
- Verification: `npm run build` passes. `/home-visit` First Load JS is now
  `115 kB`.

## 2026-09-13 — Homepage and informational routes rebuilt

- Rebuilt `/` with Tailwind/labit-style layout and local primitives while
  preserving bundled package fallback, live package refresh, promo content,
  report counter, CTAs, and accreditation sections.
- Rebuilt `/about`, `/accreditation`, `/privacy-policy`, `/tnc`, and `/feedback`.
- Removed Chakra from those routes; `/feedback` keeps rating validation and
  API submission behavior.
- Verification: `npm run build` passes. Homepage First Load JS is `121 kB`;
  `/feedback` is `106 kB`; policy/terms routes are `108 kB` and `105 kB`.

## 2026-09-13 — Labit-main social preview asset

- Confirmed Labit-main's WhatsApp main-menu banner at
  `public/assets/whatsapp/sdrc_banner.png` is the intended opening image.
- Copied it to this site as `public/assets/og-sdrc.png` and updated the root
  Open Graph, Twitter, and schema image references.
- Preserved the previous social preview as `public/assets/og-sdrc.jpg.bak`.

## 2026-09-13 — DEXA route moved off Chakra

- Rewired `/dexa-body-composition` from `@chakra-ui/react` imports to local
  Tailwind/shadcn-style layout primitives while preserving the existing DEXA
  content, structured data, report sections, CTAs, animated counters, and scan
  imagery.
- Added a narrow compatibility primitive layer for Chakra-like layout props used
  by the page; it emits regular React elements and responsive CSS, not Chakra
  runtime components.
- Verification: `npm run build` passes. `/dexa-body-composition` First Load JS
  is now `124 kB`.

## 2026-09-13 — Services route and Chakra runtime removed

- Rewired `/services` from Chakra imports to the same local Tailwind/shadcn-style
  layout primitives while preserving the hero gallery, swipe dots, desktop
  thumbnails, lightbox, service cards, structured data, and contact CTAs.
- Fixed a regression where DEXA and services sections could appear blank before
  client hydration by making `FadeIn` render visible content by default.
- Made `Counter` render final values immediately so DEXA stats are correct on
  first paint and in no-JS/slow-JS paths.
- Corrected the `NEW` badge on the SDRC Health App header CTA to use an orange
  pill with a white border and shadow on desktop, icon, and mobile-menu states.
- Removed the now-unused Chakra provider, legacy Chakra component files, Chakra
  theme file, and Chakra/Emotion/Framer dependencies.
- Verification: no `@chakra-ui/react`, Emotion, or Framer references remain in
  `app`, `components`, `lib`, or `package.json`. `npm run build` passes.
  `/dexa-body-composition` First Load JS is `109 kB`; `/services` is `118 kB`.
- Visual checks captured with headless Chrome:
  - `/tmp/sdrc-dexa-mobile-3.png`
  - `/tmp/sdrc-services-mobile-2.png`
