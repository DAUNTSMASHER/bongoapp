"use client";

import { useEffect } from "react";

/** Call once in your root layout to enable Firebase Analytics. Loads Firebase only in browser. */
export function useAnalytics() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("./firebase")
      .then(({ getFirebaseAnalytics }) => getFirebaseAnalytics())
      .catch(() => {});
  }, []);
}
