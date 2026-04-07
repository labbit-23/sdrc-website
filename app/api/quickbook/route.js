import { NextResponse } from "next/server";

function withTimeout(ms = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

function getUrls() {
  const base = process.env.QUICKBOOK_BASE_URL || "https://lab.sdrc.in";
  return {
    slotsUrl: process.env.QUICKBOOK_TIMESLOTS_URL || `${base}/api/visits/time_slots`,
    submitUrl: process.env.QUICKBOOK_SUBMIT_URL || `${base}/api/quickbook`
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "slots";
    if (type !== "slots") {
      return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
    }

    const { slotsUrl } = getUrls();
    const { controller, timer } = withTimeout(15000);
    try {
      const response = await fetch(slotsUrl, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal
      });
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        return NextResponse.json({ error: data?.error || "Unable to load time slots" }, { status: response.status });
      }
      return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to load time slots" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const payload = {
      patientName: body?.patientName || "",
      phone: body?.phone || "",
      packageName: body?.packageName || "",
      area: body?.area || "",
      date: body?.date || "",
      timeslot: body?.timeslot || "",
      persons: Number(body?.persons || 1),
      whatsapp: body?.whatsapp !== false,
      agree: body?.agree !== false,
      ...(body?.lab_id ? { lab_id: body.lab_id } : process.env.DEFAULT_LAB_ID ? { lab_id: process.env.DEFAULT_LAB_ID } : {})
    };

    const { submitUrl } = getUrls();
    const { controller, timer } = withTimeout(20000);
    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return NextResponse.json({ error: data?.error || "Quick booking failed" }, { status: response.status });
      }
      return NextResponse.json(data, { status: 200 });
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Quick booking failed" }, { status: 500 });
  }
}
