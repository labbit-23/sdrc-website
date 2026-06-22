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

export function trackEvent(eventName, payload = {}, options = {}) {
  if (typeof window === "undefined") return;
  const sessionId = getAnalyticsSessionId();
  if (!eventName || !sessionId) return;

  const utmSource = getUtmSource();
  const gclid = getGclid();
  const fbclid = getFbclid();
  const enrichedPayload = {
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
