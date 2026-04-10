import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const CACHE_TTL_MS = 30 * 1000;
const CACHE_HEADERS = { "Cache-Control": "private, max-age=20, stale-while-revalidate=40" };

const responseCache = new Map();

const FEATURE_CANDIDATES = {
  department: ["department"],
  most_common: ["is_most_common", "most_common"],
  most_popular: ["is_most_popular", "most_popular"],
  home_collection: ["home_collection", "is_home_collection_available", "home_collection_available"],
  patient_visible: ["is_patient_visible", "show_in_patient_portal", "is_patient_facing"],
  b2b_only: ["is_b2b_only", "b2b_only"],
  catalog_group: ["catalog_group", "test_group", "visibility_group"],
  test_tier: ["test_tier"]
};

function parsePagination(searchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT));
  return { page, limit };
}

function parseBoolean(searchParams, key, defaultValue) {
  const raw = searchParams.get(key);
  if (raw == null) return defaultValue;
  const value = String(raw).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(value)) return true;
  if (["0", "false", "no", "n", "off"].includes(value)) return false;
  return defaultValue;
}

function normalizeSort(sort) {
  if (sort === "price_asc") return { column: "price", ascending: true };
  if (sort === "price_desc") return { column: "price", ascending: false };
  return { column: "lab_test_name", ascending: true };
}

function extractMissingColumn(errorMessage) {
  const msg = String(errorMessage || "");
  const match = msg.match(/column\s+(?:\w+\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s+does not exist/i);
  return match?.[1] || null;
}

function createFeatureState() {
  return Object.fromEntries(
    Object.entries(FEATURE_CANDIDATES).map(([key, candidates]) => [
      key,
      {
        candidates,
        index: 0,
        enabled: candidates.length > 0
      }
    ])
  );
}

function getColumn(state, feature) {
  const slot = state[feature];
  if (!slot || !slot.enabled) return null;
  return slot.candidates[slot.index] || null;
}

function advanceFeatureStateOnMissingColumn(state, missingColumn) {
  if (!missingColumn) return false;

  for (const [feature, slot] of Object.entries(state)) {
    if (!slot.enabled) continue;
    const current = slot.candidates[slot.index];
    if (current !== missingColumn) continue;

    if (slot.index < slot.candidates.length - 1) {
      slot.index += 1;
    } else {
      slot.enabled = false;
    }
    return true;
  }

  return false;
}

function buildSelect(state) {
  const optional = [];
  const departmentCol = getColumn(state, "department");
  const mostCommonCol = getColumn(state, "most_common");
  const mostPopularCol = getColumn(state, "most_popular");
  const homeCollectionCol = getColumn(state, "home_collection");
  const patientVisibleCol = getColumn(state, "patient_visible");
  const b2bOnlyCol = getColumn(state, "b2b_only");
  const catalogGroupCol = getColumn(state, "catalog_group");
  const testTierCol = getColumn(state, "test_tier");

  if (departmentCol) optional.push(departmentCol);
  if (mostCommonCol) optional.push(mostCommonCol);
  if (mostPopularCol) optional.push(mostPopularCol);
  if (homeCollectionCol) optional.push(homeCollectionCol);
  if (patientVisibleCol) optional.push(patientVisibleCol);
  if (b2bOnlyCol) optional.push(b2bOnlyCol);
  if (catalogGroupCol) optional.push(catalogGroupCol);
  if (testTierCol) optional.push(testTierCol);

  return `
    id,
    lab_test_name,
    price,
    tat_hours,
    is_accredited,
    is_active,
    sample_type,
    internal_code,
    display_order,
    global_test_id,
    ${optional.join(",")}
    ${optional.length > 0 ? "," : ""}
    global_tests (
      id,
      standard_name,
      loinc_code
    )
  `;
}

function escapeOrLikeValue(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function applyCommonFilters(query, args, state) {
  let next = query.eq("lab_id", args.labId).eq("is_active", true);

  if (args.q.length > 0) {
    const escaped = escapeOrLikeValue(`%${args.q}%`);
    next = next.or(`lab_test_name.ilike.${escaped},internal_code.ilike.${escaped}`);
  }

  const departmentCol = getColumn(state, "department");
  const mostCommonCol = getColumn(state, "most_common");
  const mostPopularCol = getColumn(state, "most_popular");
  const homeCollectionCol = getColumn(state, "home_collection");
  const patientVisibleCol = getColumn(state, "patient_visible");
  const b2bOnlyCol = getColumn(state, "b2b_only");
  const catalogGroupCol = getColumn(state, "catalog_group");
  const testTierCol = getColumn(state, "test_tier");

  if (args.category && args.category !== "All" && departmentCol) {
    next = next.eq(departmentCol, args.category);
  }
  if (args.mostCommonOnly && mostCommonCol) {
    next = next.eq(mostCommonCol, true);
  }
  if (args.mostPopularOnly && mostPopularCol) {
    next = next.eq(mostPopularCol, true);
  }
  if (args.homeCollectionRequired && homeCollectionCol) {
    next = next.eq(homeCollectionCol, true);
  }
  if (args.tier && testTierCol) {
    next = next.eq(testTierCol, args.tier);
  }

  if (!args.includeHidden) {
    if (patientVisibleCol) {
      next = next.eq(patientVisibleCol, true);
    } else if (b2bOnlyCol) {
      next = next.eq(b2bOnlyCol, false);
    } else if (catalogGroupCol) {
      next = next.neq(catalogGroupCol, "B2B");
    }
  }

  if (args.group && catalogGroupCol) {
    next = next.eq(catalogGroupCol, args.group);
  }

  return next;
}

async function fetchWithAdaptiveFlags(args) {
  const state = createFeatureState();
  const rangeFrom = (args.page - 1) * args.limit;
  const rangeTo = rangeFrom + args.limit - 1;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    let query = supabase
      .from("lab_tests")
      .select(buildSelect(state), { count: "exact" });
    query = applyCommonFilters(query, args, state);

    const response = await query
      .order(args.sortColumn, { ascending: args.sortAscending, nullsFirst: false })
      .range(rangeFrom, rangeTo);

    if (!response.error) {
      return { ...response, state };
    }

    const missing = extractMissingColumn(response.error.message);
    const advanced = advanceFeatureStateOnMissingColumn(state, missing);
    if (!advanced) {
      return { ...response, state };
    }
  }

  return {
    data: null,
    error: { message: "Unable to resolve optional columns for tests API." },
    count: 0,
    state
  };
}

function mapFeatureInfo(state) {
  return {
    department_column: getColumn(state, "department"),
    most_common_column: getColumn(state, "most_common"),
    most_popular_column: getColumn(state, "most_popular"),
    home_collection_column: getColumn(state, "home_collection"),
    patient_visible_column: getColumn(state, "patient_visible"),
    b2b_only_column: getColumn(state, "b2b_only"),
    catalog_group_column: getColumn(state, "catalog_group"),
    test_tier_column: getColumn(state, "test_tier"),
    department_column_available: Boolean(getColumn(state, "department")),
    most_common_column_available: Boolean(getColumn(state, "most_common")),
    most_popular_column_available: Boolean(getColumn(state, "most_popular")),
    home_collection_column_available: Boolean(getColumn(state, "home_collection")),
    patient_visible_column_available: Boolean(getColumn(state, "patient_visible")),
    b2b_only_column_available: Boolean(getColumn(state, "b2b_only")),
    catalog_group_column_available: Boolean(getColumn(state, "catalog_group")),
    test_tier_column_available: Boolean(getColumn(state, "test_tier"))
  };
}

function pickBool(row, columnName) {
  if (!columnName) return null;
  return Boolean(row[columnName]);
}

function pickValue(row, columnName) {
  if (!columnName) return null;
  return row[columnName] ?? null;
}

export async function GET(request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Supabase server client not configured." }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams);

    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const tier = (searchParams.get("tier") || "").trim();
    const group = (searchParams.get("group") || "").trim();
    const sort = searchParams.get("sort") || "name_asc";
    const mostCommonOnly = parseBoolean(searchParams, "most_common", true);
    const mostPopularOnly = parseBoolean(searchParams, "most_popular", false);
    const homeCollectionRequired = parseBoolean(searchParams, "home_collection", false);
    const includeHidden = parseBoolean(searchParams, "include_hidden", false);

    const { column, ascending } = normalizeSort(sort);
    const labId = process.env.DEFAULT_LAB_ID || process.env.NEXT_PUBLIC_DEFAULT_LAB_ID;

    if (!labId) {
      return NextResponse.json({ error: "Missing DEFAULT_LAB_ID (or NEXT_PUBLIC_DEFAULT_LAB_ID)." }, { status: 500 });
    }

    const cacheKey = [
      labId,
      page,
      limit,
      q,
      category,
      tier,
      group,
      sort,
      `mc:${mostCommonOnly}`,
      `mp:${mostPopularOnly}`,
      `home:${homeCollectionRequired}`,
      `hidden:${includeHidden}`
    ].join("|");

    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.value, { headers: CACHE_HEADERS });
    }

    const { data, error, count, state } = await fetchWithAdaptiveFlags({
      page,
      limit,
      q,
      category,
      tier,
      group,
      sortColumn: column,
      sortAscending: ascending,
      labId,
      mostCommonOnly,
      mostPopularOnly,
      homeCollectionRequired,
      includeHidden
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const cols = {
      department: getColumn(state, "department"),
      mostCommon: getColumn(state, "most_common"),
      mostPopular: getColumn(state, "most_popular"),
      homeCollection: getColumn(state, "home_collection"),
      patientVisible: getColumn(state, "patient_visible"),
      b2bOnly: getColumn(state, "b2b_only"),
      catalogGroup: getColumn(state, "catalog_group"),
      testTier: getColumn(state, "test_tier")
    };

    const items = (data || []).map((row) => ({
      id: row.id,
      name: row.lab_test_name,
      internal_code: row.internal_code,
      price: row.price,
      tat_hours: row.tat_hours,
      sample_type: row.sample_type,
      is_accredited: row.is_accredited,
      is_active: row.is_active,
      is_most_common: pickBool(row, cols.mostCommon),
      is_most_popular: pickBool(row, cols.mostPopular),
      home_collection: pickBool(row, cols.homeCollection),
      is_patient_visible: pickBool(row, cols.patientVisible),
      is_b2b_only: pickBool(row, cols.b2bOnly),
      test_tier: pickValue(row, cols.testTier),
      catalog_group: pickValue(row, cols.catalogGroup),
      department: pickValue(row, cols.department),
      display_order: row.display_order,
      global_test_id: row.global_test_id,
      standard_name: row.global_tests?.standard_name || null,
      loinc_code: row.global_tests?.loinc_code || null
    }));

    let categories = [];
    if (cols.department) {
      let categoriesQuery = supabase
        .from("lab_tests")
        .select(cols.department)
        .eq("lab_id", labId)
        .eq("is_active", true);

      if (homeCollectionRequired && cols.homeCollection) {
        categoriesQuery = categoriesQuery.eq(cols.homeCollection, true);
      }

      if (!includeHidden) {
        if (cols.patientVisible) {
          categoriesQuery = categoriesQuery.eq(cols.patientVisible, true);
        } else if (cols.b2bOnly) {
          categoriesQuery = categoriesQuery.eq(cols.b2bOnly, false);
        } else if (cols.catalogGroup) {
          categoriesQuery = categoriesQuery.neq(cols.catalogGroup, "B2B");
        }
      }

      if (group && cols.catalogGroup) {
        categoriesQuery = categoriesQuery.eq(cols.catalogGroup, group);
      }

      const { data: categoriesData } = await categoriesQuery.limit(5000);
      categories = Array.from(new Set((categoriesData || []).map((r) => r[cols.department]).filter(Boolean))).sort(
        (a, b) => String(a).localeCompare(String(b))
      );
    }

    const total = count || 0;
    const payload = {
      items,
      pagination: {
        page,
        limit,
        total,
        has_next: page * limit < total
      },
      filters: {
        categories
      },
      feature_flags: mapFeatureInfo(state)
    };

    responseCache.set(cacheKey, { ts: Date.now(), value: payload });
    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error while fetching tests." },
      { status: 500 }
    );
  }
}

function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0";
  return `INR ${Number(amount).toLocaleString("en-IN")}`;
}

function toQuickbookPhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

function buildLeadMessage({
  patientName,
  patientPhone,
  patientArea,
  patientNotes,
  items,
  subtotal,
  collectionFee,
  total,
  source,
  homeVisitRequired,
  preferredDate,
  preferredTimeslot
}) {
  const now = new Date();
  const formattedDate = now.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const lines = [];
  lines.push("*New Website Lead - Cart Booking Request*");
  lines.push(`Source: ${source || "/tests page"}`);
  lines.push(`Date: ${formattedDate}`);
  lines.push(`Home Visit Required: ${homeVisitRequired ? "Yes" : "No"}`);
  if (homeVisitRequired) {
    lines.push(`Preferred Date: ${preferredDate || "Not provided"}`);
    lines.push(`Preferred Slot: ${preferredTimeslot || "Not provided"}`);
  }
  lines.push("");
  lines.push("*Patient Details*");
  lines.push(`Name: ${String(patientName || "").trim() || "Not provided"}`);
  lines.push(`Phone: ${patientPhone}`);
  lines.push(`Area: ${String(patientArea || "").trim() || "Not provided"}`);
  lines.push("");
  lines.push("*Cart Items*");
  items.forEach((item, index) => {
    const label = item.item_type === "package" ? "Package" : "Test";
    const code = item.internal_code ? ` | Code: ${item.internal_code}` : "";
    lines.push(`${index + 1}. ${label}: ${item.name}${code} | ${formatInr(item.price)}`);
  });
  lines.push("");
  lines.push(`Subtotal: ${formatInr(subtotal)}`);
  lines.push(`Collection Fee: ${formatInr(collectionFee)}`);
  lines.push(`Estimated Total: ${formatInr(total)}`);
  lines.push("");
  lines.push("*Patient Note*");
  lines.push(String(patientNotes || "").trim() || "None");
  lines.push("");
  lines.push("Action: Validate cart, confirm final cost, and share payment link.");

  return lines.join("\n");
}

function buildPatientAckMessage({
  patientName,
  itemCount,
  homeVisitRequired,
  preferredDate,
  preferredTimeslot
}) {
  const lines = [];
  lines.push(`Hello ${String(patientName || "").trim() || "Patient"},`);
  lines.push("Your booking request has been received by SDRC.");
  lines.push(`Items: ${Number(itemCount || 0)} selected`);
  if (homeVisitRequired) {
    lines.push(`Home visit: Yes (${preferredDate || "Date TBA"} • ${preferredTimeslot || "Slot TBA"})`);
  } else {
    lines.push("Home visit: No (Center visit selected)");
  }
  lines.push("Our team will validate tests and share final confirmation shortly.");
  return lines.join("\n");
}

async function sendOutboundTemplate({
  outboundUrl,
  headers,
  campaignName,
  destination,
  templateParams = []
}) {
  if (!destination) return { attempted: false, skipped: true, reason: "Missing destination" };
  const templateName = String(campaignName || "").trim();
  if (!templateName) return { attempted: false, skipped: true, reason: "Missing campaign/template name" };
  const internalSendUrl = process.env.WHATSAPP_INTERNAL_SEND_URL || process.env.LABBIT_WHATSAPP_SEND_URL || "";
  if (internalSendUrl) {
    const ingestToken = process.env.WHATSAPP_INTERNAL_SEND_TOKEN || process.env.WHATSAPP_EXTERNAL_INGEST_TOKEN || "";
    const labId = String(process.env.DEFAULT_LAB_ID || "").trim() || undefined;
    const source = String(process.env.WHATSAPP_OUTBOUND_SOURCE || "sdrc-website").trim();
    const internalHeaders = { "Content-Type": "application/json" };
    if (ingestToken) {
      internalHeaders["x-ingest-token"] = ingestToken;
    }

    const internalPayload = {
      ...(labId ? { lab_id: labId } : {}),
      destination,
      campaignName: templateName,
      templateParams: (templateParams || []).map((p) => String(p ?? "")),
      source
    };

    const internalResponse = await fetch(internalSendUrl, {
      method: "POST",
      headers: internalHeaders,
      body: JSON.stringify(internalPayload)
    });

    if (!internalResponse.ok) {
      const errText = await internalResponse.text();
      throw new Error(`WhatsApp internal gateway failed (${destination}): ${errText}`);
    }

    const provider = await internalResponse.json().catch(() => ({ ok: true }));
    return { attempted: true, skipped: false, provider, mode: "internal_gateway" };
  }

  const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en";
  const buildPayload = (params) => ({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: destination,
    type: "template",
    template: {
      name: templateName,
      language: { code: String(languageCode) },
      components: [
        {
          type: "body",
          parameters: (params || []).map((p) => ({ type: "text", text: String(p ?? "") }))
        }
      ]
    }
  });

  let payload = buildPayload(templateParams);

  let response = await fetch(outboundUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`WhatsApp outbound failed (${destination}): ${errText}`);
  }

  let provider = null;
  try {
    provider = await response.json();
  } catch {
    provider = { ok: true };
  }

  return { attempted: true, skipped: false, provider };
}

async function createClickupQuickbookTask({
  patientName,
  patientPhone,
  patientArea,
  source,
  homeVisitRequired,
  preferredDate,
  preferredTimeslot,
  items,
  subtotal,
  patientNotes
}) {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID_QUICKBOOK;
  if (!token || !listId) {
    return { attempted: false, skipped: true, reason: "Missing ClickUp token/list id" };
  }

  const itemLines = items
    .map((item, index) => `${index + 1}. [${item.item_type === "package" ? "Package" : "Test"}] ${item.name} (${formatInr(item.price)})`)
    .join("\n");

  const taskName = `Home Visit Request - ${patientName || "Patient"} - ${preferredDate || "Date TBA"}`;
  const description = [
    "New website booking request",
    `Source: ${source}`,
    `Patient: ${patientName}`,
    `Phone: ${patientPhone}`,
    `Area: ${patientArea || "Not provided"}`,
    `Home Visit: ${homeVisitRequired ? "Yes" : "No"}`,
    `Preferred Date: ${preferredDate || "Not provided"}`,
    `Preferred Slot: ${preferredTimeslot || "Not provided"}`,
    `Subtotal: ${formatInr(subtotal)}`,
    "",
    "Items:",
    itemLines || "None",
    "",
    `Note: ${patientNotes || "None"}`
  ].join("\n");

  const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: taskName,
      description,
      priority: 3,
      tags: ["website", "home-visit", "quickbook"]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ClickUp task create failed: ${errText}`);
  }

  const result = await response.json().catch(() => ({}));
  return { attempted: true, skipped: false, result };
}

async function postQuickbookingLead({
  patientName,
  patientPhone,
  patientArea,
  patientNotes,
  items,
  subtotal,
  collectionFee,
  total,
  source,
  homeVisitRequired,
  preferredDate,
  preferredTimeslot
}) {
  const flattenedItems = items
    .map((item) => `[${item.item_type === "package" ? "Package" : "Test"}] ${item.name}`)
    .filter(Boolean);
  const packageName = [
    `Cart request (${flattenedItems.length} item${flattenedItems.length === 1 ? "" : "s"})`,
    flattenedItems.join(" | "),
    patientNotes ? `Note: ${patientNotes}` : null
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 2000);

  const quickbookSubmitUrl =
    process.env.QUICKBOOK_SUBMIT_URL ||
    (process.env.QUICKBOOK_BASE_URL ? `${process.env.QUICKBOOK_BASE_URL}/api/quickbook` : "https://lab.sdrc.in/api/quickbook");
  if (quickbookSubmitUrl) {
    let resolvedTimeslot = String(preferredTimeslot || "").trim();
    if (!resolvedTimeslot) {
      const slotsUrl =
        process.env.QUICKBOOK_TIMESLOTS_URL ||
        (process.env.QUICKBOOK_BASE_URL ? `${process.env.QUICKBOOK_BASE_URL}/api/visits/time_slots` : "https://lab.sdrc.in/api/visits/time_slots");
      try {
        const slotResponse = await fetch(slotsUrl, { method: "GET", cache: "no-store" });
        if (slotResponse.ok) {
          const slots = await slotResponse.json().catch(() => []);
          if (Array.isArray(slots) && slots.length > 0) {
            const first = slots[0] || {};
            resolvedTimeslot = String(first.id || first.slot_name || first.title || "").trim();
          }
        }
      } catch {
        resolvedTimeslot = "";
      }
    }
    if (!resolvedTimeslot) {
      resolvedTimeslot = String(process.env.QUICKBOOK_DEFAULT_TIMESLOT_ID || "").trim();
    }
    if (!resolvedTimeslot) {
      throw new Error("Quickbook slot unavailable: no timeslot selected and no default timeslot id configured.");
    }

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const fallbackDate = tomorrow.toISOString().slice(0, 10);
    const requestPayloadJson = {
      source,
      comments: patientNotes || null,
      pricing: {
        subtotal: Number(subtotal || 0),
        collection_fee: collectionFee == null ? null : Number(collectionFee),
        total: Number(total || 0)
      },
      items: (items || []).map((item) => ({
        id: item?.id || null,
        type: item?.item_type === "package" ? "package" : "test",
        name: String(item?.name || "").trim(),
        price: item?.price == null ? null : Number(item.price),
        internal_code: item?.internal_code || null,
        home_collection: typeof item?.home_collection === "boolean" ? item.home_collection : null
      }))
    };
    const payload = {
      patientName,
      phone: toQuickbookPhone(patientPhone),
      packageName,
      area: patientArea || "",
      date: preferredDate || fallbackDate,
      timeslot: resolvedTimeslot,
      persons: 1,
      whatsapp: true,
      agree: true,
      home_visit_required: Boolean(homeVisitRequired),
      request_payload_json: requestPayloadJson,
      ...(process.env.DEFAULT_LAB_ID ? { lab_id: process.env.DEFAULT_LAB_ID } : {})
    };

    const response = await fetch(quickbookSubmitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Quickbook submit failed: ${errText}`);
    }
    const result = await response.json().catch(() => ({ ok: true }));
    return { attempted: true, skipped: false, mode: "quickbook_submit", result };
  }

  const quickbookingUrl = process.env.QUICKBOOKING_LEAD_URL;
  if (!quickbookingUrl) return { attempted: false, skipped: true, reason: "No quickbooking endpoint configured" };

  const payload = {
    source,
    patient_name: patientName,
    patient_phone: patientPhone,
    patient_area: patientArea || "",
    patient_notes: patientNotes,
    subtotal,
    collection_fee: collectionFee,
    total,
    items,
    preferred_date: preferredDate || null,
    preferred_timeslot: preferredTimeslot || null
  };

  const headers = { "Content-Type": "application/json" };
  if (process.env.QUICKBOOKING_LEAD_TOKEN) {
    headers.Authorization = `Bearer ${process.env.QUICKBOOKING_LEAD_TOKEN}`;
  }

  const response = await fetch(quickbookingUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Quickbooking lead failed: ${errText}`);
  }

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = { ok: true };
  }

  return { attempted: true, skipped: false, mode: "lead_webhook", result };
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body?.action !== "send_whatsapp_lead") {
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    }

    const items = Array.isArray(body?.items) ? body.items : [];

    const patientName = String(body?.patient_name || "").trim();
    const patientPhone = normalizePhone(body?.patient_phone || "");
    const patientArea = String(body?.patient_area || "").trim();
    const patientNotes = String(body?.patient_notes || "").trim();
    const source = String(body?.source || "/tests page");
    const homeVisitRequired = Boolean(body?.home_visit_required);
    const preferredDate = String(body?.preferred_date || "").trim();
    const preferredTimeslot = String(body?.preferred_timeslot || "").trim();
    const subtotal = Number(body?.subtotal || 0);
    const collectionFee = Number(body?.collection_fee || 0);
    const total = Number(body?.total || subtotal + collectionFee);
    const shouldRouteQuickbooking = true;

    if (patientPhone.length < 10) {
      return NextResponse.json({ error: "Invalid patient phone number." }, { status: 400 });
    }

    if (shouldRouteQuickbooking) {
      const quickbooking = await postQuickbookingLead({
        patientName,
        patientPhone,
        patientArea,
        patientNotes,
        items,
        subtotal,
        collectionFee,
        total,
        source,
        homeVisitRequired,
        preferredDate,
        preferredTimeslot
      });

      return NextResponse.json({
        success: true,
        mode: "quickbook_only",
        quickbooking,
        templates: {
          patient: { attempted: false, skipped: true, reason: "Delegated to quickbook flow" },
          internal: { attempted: false, skipped: true, reason: "Delegated to quickbook flow" }
        },
        clickup: { attempted: false, skipped: true, reason: "Delegated to quickbook flow" }
      });
    }

    const outboundUrl = process.env.WHATSAPP_OUTBOUND_URL;
    const internalSendUrl = process.env.WHATSAPP_INTERNAL_SEND_URL || process.env.LABBIT_WHATSAPP_SEND_URL || "";
    const destination = normalizePhone(
      process.env.INTERNAL_NOTIFY_WHATSAPP || process.env.NEXT_PUBLIC_INTERNAL_NOTIFY_WHATSAPP || ""
    );
    const apiKey = process.env.WHATSAPP_OUTBOUND_API_KEY || "";
    const campaignName = process.env.WHATSAPP_OUTBOUND_CAMPAIGN || "website_lead";

    if (!internalSendUrl && !outboundUrl) {
      return NextResponse.json({ error: "Missing WhatsApp outbound config (WHATSAPP_INTERNAL_SEND_URL or WHATSAPP_OUTBOUND_URL)." }, { status: 500 });
    }
    if (!destination) {
      return NextResponse.json({ error: "Missing INTERNAL_NOTIFY_WHATSAPP." }, { status: 500 });
    }

    const message = buildLeadMessage({
      patientName,
      patientPhone,
      patientArea,
      patientNotes,
      items,
      subtotal,
      collectionFee,
      total,
      source,
      homeVisitRequired,
      preferredDate,
      preferredTimeslot
    });
    const patientAckMessage = buildPatientAckMessage({
      patientName,
      itemCount: items.length,
      homeVisitRequired,
      preferredDate,
      preferredTimeslot
    });

    const headers = { "Content-Type": "application/json" };
    if (apiKey) {
      const apiKeyHeader = process.env.WHATSAPP_OUTBOUND_API_KEY_HEADER || "X-API-KEY";
      headers[apiKeyHeader] = apiKey;
    }
    if (process.env.WHATSAPP_OUTBOUND_BEARER_TOKEN) {
      headers.Authorization = `Bearer ${process.env.WHATSAPP_OUTBOUND_BEARER_TOKEN}`;
    }

    let patientTemplate = { attempted: false, skipped: true };
    let internalTemplate = { attempted: false, skipped: true };
    let patientError = null;
    let internalError = null;

    try {
      patientTemplate = await sendOutboundTemplate({
        outboundUrl,
        headers,
        campaignName,
        destination: patientPhone,
        templateParams: [patientAckMessage]
      });
    } catch (error) {
      patientError = error?.message || "Patient WhatsApp send failed";
      patientTemplate = { attempted: true, failed: true, error: patientError };
    }

    try {
      internalTemplate = await sendOutboundTemplate({
        outboundUrl,
        headers,
        campaignName,
        destination,
        templateParams: [message]
      });
    } catch (error) {
      internalError = error?.message || "Internal WhatsApp send failed";
      internalTemplate = { attempted: true, failed: true, error: internalError };
    }

    if (patientError && internalError) {
      console.error("[/api/tests] WhatsApp outbound failed for both destinations", {
        patientError,
        internalError
      });
      return NextResponse.json(
        { error: `WhatsApp send failed. Patient: ${patientError}. Internal: ${internalError}.` },
        { status: 502 }
      );
    }

    const quickbooking = { attempted: false, skipped: true, reason: "Not eligible" };

    const clickup = await createClickupQuickbookTask({
      patientName,
      patientPhone,
      patientArea,
      source,
      homeVisitRequired,
      preferredDate,
      preferredTimeslot,
      items,
      subtotal,
      patientNotes
    });

    return NextResponse.json({
      success: true,
      destination,
      templates: {
        patient: patientTemplate,
        internal: internalTemplate
      },
      quickbooking,
      clickup
    });
  } catch (error) {
    console.error("[/api/tests] POST send_whatsapp_lead failed:", error);
    return NextResponse.json(
      { error: error?.message || "Unexpected error while sending WhatsApp lead." },
      { status: 500 }
    );
  }
}
