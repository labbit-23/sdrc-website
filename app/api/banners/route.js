import { NextResponse } from "next/server";
import bannerData from "@/data/banners.json";

// Same banners the homepage shows, as JSON, so the SDRC Health app can show them too.
export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const live = (bannerData.banners || []).filter(
    (b) => b.image && (!b.start || b.start <= today) && (!b.end || b.end >= today)
  );
  return NextResponse.json({ banners: live });
}
