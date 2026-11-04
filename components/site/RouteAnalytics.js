"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent, captureTrackingIds } from "@/lib/analytics";

export default function RouteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    captureTrackingIds();
  }, []);

  // Contact intent: calls, WhatsApp chats and hand-offs to the app are the real conversions for a lab, and they leave
  // the page, so they are caught here with one delegated listener rather than wired into every button.
  useEffect(() => {
    function onClick(e) {
      const a = e.target?.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      let name = "";
      if (href.startsWith("tel:")) name = "call_click";
      else if (/^https?:\/\/wa\.me\//.test(href) || href.includes("api.whatsapp.com")) name = "whatsapp_click";
      else if (/^https?:\/\/app\.(sdrc\.in|labit\.online)/.test(href)) name = "app_click";
      if (!name) return;
      const placement = a.closest("[data-track]")?.getAttribute("data-track") || a.closest("section,header,footer")?.tagName?.toLowerCase() || "page";
      trackEvent(name, { placement, label: (a.textContent || "").trim().slice(0, 60) });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!pathname) return;
    trackEvent("page_view", { page_type: "route" }, { pagePath: pathname });
  }, [pathname]);

  return null;
}
