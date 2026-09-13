import { NextResponse } from "next/server";
import { getCurrentPromo } from "@/data/featuredPromo";

// New route, 2026-09-13 -- the homepage's own promo banner
// (getCurrentPromo/data/promos.json) had no API surface at all, bundled
// import only. labit-patient wants the SAME promo shown on its own
// Dashboard ("pick up the promo banner from the website for it") --
// this exposes it as JSON rather than duplicating the content into a
// second copy that would silently drift.
export async function GET() {
  const promo = getCurrentPromo();
  return NextResponse.json(promo || null);
}
