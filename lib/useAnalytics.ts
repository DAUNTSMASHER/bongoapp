"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "./firebase";

/** Call once in your root layout to enable Firebase Analytics. */
export function useAnalytics() {
  useEffect(() => {
    getFirebaseAnalytics();
  }, []);
}
