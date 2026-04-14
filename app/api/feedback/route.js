import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const rating = Number(body?.rating || 0);
    const feedback = String(body?.feedback || "").trim().slice(0, 500);
    const patientPhone = normalizePhone(body?.patient_phone || "");
    const labId = String(body?.lab_id || process.env.DEFAULT_LAB_ID || "").trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!labId) {
      return NextResponse.json({ ok: false, error: "Lab ID missing. Set DEFAULT_LAB_ID." }, { status: 500 });
    }

    const endpoint = (process.env.FEEDBACK_API_URL || "https://lab.sdrc.in/api/feedback").trim();
    const payload = {
      rating,
      feedback,
      patient_phone: patientPhone || null,
      lab_id: labId,
      source: "public",
      metadata: {
        captured_via: "sdrc_website_feedback",
        page: "/"
      }
    };

    const headers = { "Content-Type": "application/json" };
    if (process.env.FEEDBACK_API_TOKEN) {
      headers.Authorization = `Bearer ${process.env.FEEDBACK_API_TOKEN}`;
    }

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok || data?.ok === false) {
      return NextResponse.json(
        { ok: false, error: data?.error || `Feedback API failed (${upstream.status})` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, stored: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unable to submit feedback" },
      { status: 500 }
    );
  }
}
