"use client";

export const ANALYTICS_SESSION_KEY = "sdrc_anon_session_id_v1";
export const ANALYTICS_UTM_SOURCE_KEY = "sdrc_utm_source_v1";
export const ANALYTICS_GCLID_KEY = "sdrc_gclid_v1";
export const ANALYTICS_FBCLID_KEY = "sdrc_fbclid_v1";

function generateSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(ANALYTICS_SESSION_KEY);
    if (existing) return existing;
    const next = generateSessionId();
    window.localStorage.setItem(ANALYTICS_SESSION_KEY, next);
    return next;
  } catch {
    return "";
  }
}

export function captureTrackingIds() {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const gclid = params.get("gclid");
    const fbclid = params.get("fbclid");

    if (gclid) {
      window.localStorage.setItem(ANALYTICS_GCLID_KEY, gclid);
    }
    if (fbclid) {
      window.localStorage.setItem(ANALYTICS_FBCLID_KEY, fbclid);
    }

    let derivedUtmSource = utmSource;
    if (!derivedUtmSource) {
      if (gclid) derivedUtmSource = "google";
      else if (fbclid) derivedUtmSource = "facebook";
    }

    if (derivedUtmSource) {
      window.localStorage.setItem(ANALYTICS_UTM_SOURCE_KEY, derivedUtmSource);
    }

    return {
      utm_source: derivedUtmSource || window.localStorage.getItem(ANALYTICS_UTM_SOURCE_KEY),
      gclid: gclid || window.localStorage.getItem(ANALYTICS_GCLID_KEY),
      fbclid: fbclid || window.localStorage.getItem(ANALYTICS_FBCLID_KEY)
    };
  } catch {
    return {};
  }
}

export function getUtmSource() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ANALYTICS_UTM_SOURCE_KEY) || "";
  } catch {
    return "";
  }
}

export function getGclid() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ANALYTICS_GCLID_KEY) || "";
  } catch {
    return "";
  }
}

export function getFbclid() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ANALYTICS_FBCLID_KEY) || "";
  } catch {
    return "";
  }
}

const FIRST_TOUCH_KEY = "sdrc_first_touch_v1";

function deviceType() {
  const w = window.innerWidth || 0;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

function referrerHost(ref) {
  try { return ref ? new URL(ref).hostname.replace(/^www\./, "") : ""; } catch { return ""; }
}

// First visit is remembered so every later event can say "new or returning" and which page/where from brought them.
function firstTouch() {
  try {
    const raw = window.localStorage.getItem(FIRST_TOUCH_KEY);
    if (raw) return { ...JSON.parse(raw), returning: true };
    const ft = { at: new Date().toISOString(), landing: window.location.pathname, ref_host: referrerHost(document.referrer) };
    window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(ft));
    return { ...ft, returning: false };
  } catch {
    return {};
  }
}

// Same context on every event, so the dashboard can slice any metric by device / new vs returning / landing page / referrer.
function eventContext() {
  const ft = firstTouch();
  return {
    device: deviceType(),
    returning: !!ft.returning,
    landing_path: ft.landing || null,
    first_ref_host: ft.ref_host || null,
    ref_host: referrerHost(document?.referrer || "") || null,
    lang: (navigator.language || "").slice(0, 10) || null
  };
}

export function trackEvent(eventName, payload = {}, options = {}) {
  if (typeof window === "undefined") return;
  const sessionId = getAnalyticsSessionId();
  if (!eventName || !sessionId) return;

  const utmSource = getUtmSource();
  const gclid = getGclid();
  const fbclid = getFbclid();
  const enrichedPayload = {
    ...eventContext(),
    ...payload,
    ...(utmSource && { utm_source: utmSource }),
    ...(gclid && { gclid }),
    ...(fbclid && { fbclid })
  };

  const body = JSON.stringify({
    event_name: eventName,
    session_id: sessionId,
    page_path: options.pagePath || window.location.pathname,
    referrer: document?.referrer || "",
    phone: options.phone || null,
    utm_source: utmSource || null,
    gclid: gclid || null,
    fbclid: fbclid || null,
    payload: enrichedPayload
  });

  try {
    if (navigator?.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/event", blob);
      return;
    }
  } catch {}

  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}
