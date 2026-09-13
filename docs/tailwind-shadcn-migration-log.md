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
