import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

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

function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function sanitizeFileName(name) {
  return String(name || "prescription")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0";
  return `INR ${Number(amount).toLocaleString("en-IN")}`;
}

function buildQuickbookMessage({ patientName, phone, packageName, area, date, timeslot, prescriptionUrl }) {
  const prescriptionLine = prescriptionUrl ? `Prescription: ${prescriptionUrl}` : "Prescription: Not uploaded";
  return [
    "*New Home Visit Request*",
    `Patient: ${patientName || "Not provided"}`,
    `Phone: ${phone || "Not provided"}`,
    `Date: ${date || "Not provided"}`,
    `Slot: ${timeslot || "Not provided"}`,
    `Tests/Package: ${packageName || "General test booking"}`,
    `Area: ${area || "Not provided"}`,
    prescriptionLine
  ].join("\n");
}

async function sendOutboundTemplate({ destination, userName, message }) {
  const outboundUrl = process.env.WHATSAPP_OUTBOUND_URL;
  if (!outboundUrl || !destination) return { attempted: false, skipped: true };

  const apiKey = process.env.WHATSAPP_OUTBOUND_API_KEY || "";
  const campaignName = process.env.WHATSAPP_OUTBOUND_CAMPAIGN || "website_lead";
  const outboundSource = process.env.WHATSAPP_OUTBOUND_SOURCE || "sdrc-website";
  const headers = { "Content-Type": "application/json" };
  if (apiKey) {
    const apiKeyHeader = process.env.WHATSAPP_OUTBOUND_API_KEY_HEADER || "X-API-KEY";
    headers[apiKeyHeader] = apiKey;
  }
  if (process.env.WHATSAPP_OUTBOUND_BEARER_TOKEN) {
    headers.Authorization = `Bearer ${process.env.WHATSAPP_OUTBOUND_BEARER_TOKEN}`;
  }

  const payload = {
    lab_id: process.env.DEFAULT_LAB_ID || process.env.NEXT_PUBLIC_DEFAULT_LAB_ID || undefined,
    apiKey,
    campaignName,
    destination,
    userName: userName || "Website Lead",
    source: outboundSource,
    templateParams: [message]
  };

  const response = await fetch(outboundUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`WhatsApp outbound failed (${destination}): ${errText}`);
  }
  const provider = await response.json().catch(() => ({ ok: true }));
  return { attempted: true, skipped: false, provider };
}

async function createClickupTask({ patientName, phone, packageName, area, date, timeslot, prescriptionUrl }) {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID_QUICKBOOK;
  if (!token || !listId) return { attempted: false, skipped: true };

  const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `Home Visit Request - ${patientName || "Patient"} - ${date || "Date TBA"}`,
      description: [
        "New home visit request from website quick-book flow",
        `Patient: ${patientName || ""}`,
        `Phone: ${phone || ""}`,
        `Date: ${date || ""}`,
        `Slot: ${timeslot || ""}`,
        `Tests/Package: ${packageName || "General test booking"}`,
        `Area: ${area || ""}`,
        `Prescription: ${prescriptionUrl || "Not uploaded"}`
      ].join("\n"),
      priority: 3,
      tags: ["website", "quickbook", "home-visit"]
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ClickUp task create failed: ${errText}`);
  }
  const result = await response.json().catch(() => ({}));
  return { attempted: true, skipped: false, result };
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
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      if (!supabase) {
        return NextResponse.json({ error: "Supabase server client not configured." }, { status: 500 });
      }
      const formData = await request.formData();
      const action = String(formData.get("action") || "").trim();
      if (action && action !== "upload_prescription") {
        return NextResponse.json({ error: "Unsupported multipart action." }, { status: 400 });
      }

      const file = formData.get("file");
      const rawPhone = formData.get("patient_phone");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }
      if (file.size <= 0) {
        return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "File too large. Max 8 MB." }, { status: 400 });
      }
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json({ error: "Unsupported file type. Use PDF/JPG/PNG/WEBP." }, { status: 400 });
      }

      const bucket = process.env.SUPABASE_PRESCRIPTION_BUCKET || "uploads";
      const phone = normalizePhone(rawPhone);
      const safeName = sanitizeFileName(file.name);
      const ext = safeName.includes(".") ? safeName.split(".").pop() : "";
      const objectPath = `prescriptions/quickbook/${phone || "unknown"}/${Date.now()}-${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

      const bytes = Buffer.from(await file.arrayBuffer());
      const uploadResult = await supabase.storage
        .from(bucket)
        .upload(objectPath, bytes, {
          contentType: file.type || "application/octet-stream",
          upsert: false
        });
      if (uploadResult.error) {
        return NextResponse.json({ error: uploadResult.error.message || "Upload failed." }, { status: 500 });
      }

      const signed = await supabase.storage.from(bucket).createSignedUrl(objectPath, 60 * 60 * 24 * 30);
      return NextResponse.json({
        file_name: safeName,
        bucket,
        path: objectPath,
        url: signed.data?.signedUrl || null
      }, { status: 200 });
    }

    const body = await request.json();

    const phone = normalizePhone(body?.phone || "");
    const payload = {
      patientName: body?.patientName || "",
      phone,
      packageName: body?.packageName || "",
      area: body?.area || "",
      date: body?.date || "",
      timeslot: body?.timeslot || "",
      prescription_url: body?.prescription_url || "",
      prescription_path: body?.prescription_path || "",
      prescription_file_name: body?.prescription_file_name || "",
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

      const internalNotify = normalizePhone(
        process.env.INTERNAL_NOTIFY_WHATSAPP || process.env.NEXT_PUBLIC_INTERNAL_NOTIFY_WHATSAPP || ""
      );
      const message = buildQuickbookMessage({
        patientName: payload.patientName,
        phone: payload.phone,
        packageName: payload.packageName,
        area: payload.area,
        date: payload.date,
        timeslot: payload.timeslot,
        prescriptionUrl: payload.prescription_url
      });

      let templates = { patient: { attempted: false, skipped: true }, internal: { attempted: false, skipped: true } };
      let clickup = { attempted: false, skipped: true };
      try {
        templates.patient = await sendOutboundTemplate({
          destination: phone,
          userName: payload.patientName || "Patient",
          message
        });
      } catch (error) {
        templates.patient = { attempted: true, failed: true, error: error?.message || "Template send failed" };
      }
      try {
        templates.internal = await sendOutboundTemplate({
          destination: internalNotify,
          userName: payload.patientName || "Website Lead",
          message
        });
      } catch (error) {
        templates.internal = { attempted: true, failed: true, error: error?.message || "Template send failed" };
      }
      try {
        clickup = await createClickupTask({
          patientName: payload.patientName,
          phone: payload.phone,
          packageName: payload.packageName,
          area: payload.area,
          date: payload.date,
          timeslot: payload.timeslot,
          prescriptionUrl: payload.prescription_url
        });
      } catch (error) {
        clickup = { attempted: true, failed: true, error: error?.message || "ClickUp task failed" };
      }

      return NextResponse.json({ ...data, templates, clickup }, { status: 200 });
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Quick booking failed" }, { status: 500 });
  }
}
