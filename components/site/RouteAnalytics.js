"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent, captureTrackingIds } from "@/lib/analytics";

export default function RouteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    captureTrackingIds();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    trackEvent("page_view", { page_type: "route" }, { pagePath: pathname });
  }, [pathname]);

  return null;
}
