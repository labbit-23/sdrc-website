"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function RouteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackEvent("page_view", { page_type: "route" }, { pagePath: pathname });
  }, [pathname]);

  return null;
}
