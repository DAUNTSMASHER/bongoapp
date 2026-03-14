"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function trackPageView(path: string) {
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "pageview", path }),
    keepalive: true,
  }).catch(() => {});
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = pathname ?? "/";
    if (path.startsWith("/admin")) return;
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackPageView(path);
  }, [pathname]);

  return null;
}
