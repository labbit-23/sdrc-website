// Update `current` each month to rotate the featured service/package.
// month: "YYYY-MM" — matched against today's date at render time.

const promos = {
  "2026-05": {
    badge: "Featured this month",
    eyebrow: "Body Composition & Bone Health",
    headline: "Know exactly what your body is made of",
    subline: "DEXA Whole Body Scan",
    body: "One scan. Fat %, lean mass, bone mineral density — all measured simultaneously and separated by region. The gold standard for body composition, now at SDRC.",
    bullets: [
      "Body fat % compared to same-age peers",
      "Lean & muscle mass by region",
      "Bone mineral density (T-score & Z-score)",
      "Android / gynoid fat distribution ratio",
      "Resting metabolic rate estimate",
    ],
    href: "/dexa-body-composition",
    ctaLabel: "Learn about DEXA",
    bookLabel: "Book DEXA Scan",
    bookHref: "/tests?q=DEXA",
    accent: "#008f82",          // teal
    accentLight: "#e6f6f4",
    image: "/assets/dexa/fat-heatmap.webp",
    imageAlt: "DEXA fat distribution heatmap scan",
  },
};

// Returns the promo for the current month, or null if none configured.
export function getCurrentPromo() {
  if (typeof window === "undefined") {
    // SSR: use a fixed date-string; Next.js will re-render on client
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return promos[key] ?? null;
  }
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return promos[key] ?? null;
}
