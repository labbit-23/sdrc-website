import { NextResponse } from "next/server";
import healthPackagesData from "@/data/health-packages.json";

// labit-main's /api/health-packages is the maintained source (its own
// lib/data/health-packages.json is kept in sync from THIS repo's data/
// via scripts/sync-health-packages.mjs, run manually whenever this file
// changes) -- point there first so a package/price edit here reaches
// labit-main's own consumers (its WhatsApp bot) and this site from one
// place, without a second manual sync step in the other direction.
// Falls back to this repo's own bundled copy (already imported by
// app/page.js / app/tests/page.js) on any failure -- this route, and the
// site, must never go down just because labit-main is briefly
// unreachable. 2026-09-12: the site's OWN data/health-packages.json had
// drifted from labit-main's more-current copy for months with nothing
// surfacing it; this closes that gap by making labit-main authoritative
// at request time instead of relying on someone remembering to re-run
// the sync script.
const LABIT_MAIN_URL = (process.env.LABIT_MAIN_BASE_URL || "https://lab.sdrc.in") + "/api/health-packages";

export async function GET() {
  try {
    const res = await fetch(LABIT_MAIN_URL, { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.packages)) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // fall through to local copy
  }
  return NextResponse.json(healthPackagesData);
}
