import { siteConfig } from "@/data/siteConfig";

// Builds the "sign in to pay and continue" link into the SDRC Health app.
// The cart travels in the URL fragment (after #), so it never reaches a server or a log, and carries
// only names and codes: the app looks up its own prices and never trusts a price from the link.
export function buildAppHandoffUrl(cartItems) {
  const items = (cartItems || [])
    .map((i) => ({
      k: i.item_type === "package" ? "p" : "t",
      n: String(i.name || "").slice(0, 120),
      c: i.internal_code ? String(i.internal_code).trim().toUpperCase() : undefined,
    }))
    .filter((i) => i.n)
    .slice(0, 40);
  if (!items.length) return siteConfig.patientAppUrl;
  const json = JSON.stringify(items);
  const b64 = typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)));
  const safe = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${siteConfig.patientAppUrl}/#cart=${safe}`;
}
