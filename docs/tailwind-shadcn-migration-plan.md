# sdrc-website: Chakra UI → Tailwind v4 + Radix/shadcn migration

## Context

This repo (`sdrc-website`, the public marketing site) is currently the odd one out
across the labit ecosystem:

| Repo            | Role                                | Stack                                        |
|-----------------|--------------------------------------|-----------------------------------------------|
| `labit-ui`      | Staff workspace ("the UI")           | Tailwind v4 + Radix/shadcn                    |
| `labit-patient` | Patient app ("the App")              | Tailwind v4 + Radix/shadcn (ported from labit-ui) |
| `labit-main`    | Legacy internal frontend/API host    | Chakra UI v2                                  |
| `sdrc-website`  | Public marketing site (**this repo**)| Chakra UI v3 + Emotion + Framer Motion        |

Goal of this task: port `sdrc-website` from Chakra UI v3 to Tailwind v4 + Radix/shadcn,
matching the `labit-ui` / `labit-patient` stack, with **no visible UX/UI regression** —
this is a like-for-like rebuild of the presentation layer, not a redesign.

## Why (and why not)

- **For:** one design vocabulary across repos — copy components (header, cards,
  buttons, form controls) between `labit-ui`, `labit-patient`, and this site instead
  of re-deriving them per-stack. Likely a modest bundle-size/perf win (Tailwind +
  Radix is typically leaner than Chakra + Emotion).
- **Against / risk:** this is a live, auto-deploys-on-push, revenue-adjacent
  marketing site with no functional problems tied to Chakra today. The work is
  pure infra/consistency — no new user-facing feature — so the only real risk is
  visual/interaction regression. Treat this as a **rebuild done carefully**, not
  a refactor done fast.

## Current-state inventory (as of 2026-09-13, commit `4790b08`)

- Stack: `@chakra-ui/react@^3.24.2`, `@emotion/react`, `@emotion/styled`,
  `framer-motion@^12`, Next.js 15.4.10 (App Router), React 19.
- 16 pages under `app/*/page.js` (+ `app/page.js` homepage).
- ~13 shared components in `components/` and `components/site/`, `components/cart/`,
  `components/booking/`.
- 24 files import `@chakra-ui/react` directly (style props, `SimpleGrid`, `HStack`,
  `VStack`, responsive object props like `display={{ base: "none", lg: "flex" }}`,
  `_hover`, etc.) — every one of these needs to be rewritten, not wrapped.
- `app/globals.css` (370 lines) carries hand-rolled, Chakra-independent CSS:
  hero reveal animations (`rise-in`, `hero-title`, `hero-subline`,
  `hero-visual-reveal`), floating blob animation (`float-slow`), the
  `book-test-cta` ribbon effect, `brochure-bg` / `home-hero-cover` backgrounds,
  `soft-card` / `no-hover-lift` utility classes. These port to Tailwind
  (`@layer`, arbitrary values, `@keyframes`) largely as-is — no loss expected here.
- Chakra theme/provider: `app/providers.js` (currently minimal — check for
  `extendTheme` customizations before assuming defaults).
- Stray already-present files `public/assets/tailwind.css` and
  `public/assets/tailwind-lite.css` exist but are **not** wired into the Next
  build — confirm what these are (legacy static assets?) before reusing/deleting.
- No existing native app — footer/hero "SDRC Health App" promo added 2026-09-13
  links to `https://app.sdrc.in` (the `labit-patient` web app); keep this intact
  through the migration.

## Scope

In scope:
- Replace Chakra UI, Emotion, and Chakra's `ChakraProvider`/theme with Tailwind v4
  + Radix primitives + shadcn components, mirroring `labit-ui`'s setup (same
  Tailwind config conventions, same shadcn component installation pattern, same
  design tokens where they overlap — brand teal `#008f82`/`#00695f`, orange
  accent `orange.500`, dark footer `#0f172a`, NABL green `#22c55e`).
- Rebuild every page and shared component listed above, 1:1 in layout and
  behavior.
- Port `app/globals.css` custom animations/utility classes to Tailwind.
- Preserve all `next/link`, `next/image`, and existing route structure exactly —
  this is styling-layer only, not a routing or data-layer change.
- Preserve SEO/schema.org markup, sitemap, robots, and analytics
  (`components/site/RouteAnalytics.js`) untouched.

Out of scope (do not touch as part of this task):
- Any backend/API route (`app/api/**`), Supabase client, cart logic, booking flow
  logic — only their presentational wrappers change.
- Redesign of layout, copy, or information architecture. If something looks
  "off" in Chakra, fix it in a separate follow-up, not silently during this port.
- `labit-main` (Chakra v2) — not part of this task.

## Suggested approach

1. **Set up the stack** — bring in Tailwind v4, Radix, and shadcn's CLI/config the
   same way `labit-ui` did (copy its `tailwind.config`, `components.json`, base
   `globals.css` reset/tokens as a starting point rather than reinventing).
2. **Port design tokens first** — brand colors, spacing scale, font, border
   radii, shadow ("soft-card") as Tailwind theme extensions / CSS variables,
   so every component migration afterward pulls from one source of truth.
3. **Migrate leaf → root**: shared primitives and small components first
   (`SiteHeader`, `SiteFooter`, `PageHero`, cart/booking widgets), then page by
   page, ending with `app/page.js` (the homepage, largest/most animated page).
4. **Visual QA per page**: side-by-side diff against the live Chakra version
   (screenshot compare at mobile/tablet/desktop breakpoints) before merging each
   page. Given no test suite covers visual output, this manual pass is the main
   regression gate.
5. **Cut over `app/providers.js`** and remove Chakra/Emotion/Framer Motion deps
   only after every page is migrated and verified — keep both stacks compiling
   side-by-side during the transition rather than a big-bang swap, to keep the
   site deployable at every commit (this repo auto-deploys to Vercel on push to
   `main`; prefer a feature branch + PR for this whole effort rather than direct
   pushes to `main`).
6. **Final pass**: delete Chakra/Emotion/Framer Motion from `package.json`,
   confirm bundle size delta, run `next build` + lint clean, spot-check all 16
   routes.

## Effort estimate

~1–2 weeks for one engineer familiar with both stacks, given the page/component
count above. Budget extra time for visual QA — that's the actual risk surface,
not the mechanical class-for-prop translation.

## Acceptance criteria

- All 16 routes render with no visual regression at mobile (≤400px), tablet, and
  desktop breakpoints, verified by manual comparison against the pre-migration
  site.
- `npm run build` / `next lint` clean, no Chakra/Emotion/Framer Motion imports
  remaining anywhere in `app/` or `components/`.
- `package.json` no longer lists `@chakra-ui/react`, `@emotion/react`,
  `@emotion/styled`, `framer-motion` (unless Framer Motion is intentionally kept
  for animation — decide during token/setup phase and note the decision here).
- SEO markup, sitemap, robots.txt, and analytics event firing unchanged
  (verify `components/site/RouteAnalytics.js` still fires on route change).
- Progress and decisions tracked in `docs/tailwind-shadcn-migration-log.md`
  (see that file) as the work proceeds.
