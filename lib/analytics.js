"use client";

export const ANALYTICS_SESSION_KEY = "sdrc_anon_session_id_v1";

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

export function trackEvent(eventName, payload = {}, options = {}) {
  if (typeof window === "undefined") return;
  const sessionId = getAnalyticsSessionId();
  if (!eventName || !sessionId) return;

  const body = JSON.stringify({
    event_name: eventName,
    session_id: sessionId,
    page_path: options.pagePath || window.location.pathname,
    referrer: document?.referrer || "",
    phone: options.phone || null,
    payload
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
