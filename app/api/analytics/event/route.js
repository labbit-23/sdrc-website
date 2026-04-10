import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.ANALYTICS_IP_SALT || "";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function readClientIp(req) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  if (!fwd) return "";
  return String(fwd.split(",")[0] || "").trim();
}

export async function POST(req) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const eventName = String(body?.event_name || "").trim();
    const sessionId = String(body?.session_id || "").trim();

    if (!eventName || !sessionId) {
      return NextResponse.json({ error: "event_name and session_id are required" }, { status: 400 });
    }

    const row = {
      session_id: sessionId.slice(0, 128),
      lab_id: String(process.env.DEFAULT_LAB_ID || "").trim() || null,
      event_name: eventName.slice(0, 80),
      page_path: String(body?.page_path || "").slice(0, 300) || null,
      referrer: String(body?.referrer || "").slice(0, 500) || null,
      user_agent: String(req.headers.get("user-agent") || "").slice(0, 500) || null,
      ip_hash: hashIp(readClientIp(req)),
      phone: String(body?.phone || "").replace(/\D/g, "").slice(0, 20) || null,
      payload: body?.payload && typeof body.payload === "object" ? body.payload : {}
    };

    const { error } = await supabase.from("website_events").insert(row);
    if (error) {
      console.error("[analytics.event] insert error", error);
      return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics.event] unexpected error", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
