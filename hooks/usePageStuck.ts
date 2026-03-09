"use client";

import { useState, useEffect } from "react";

/** Returns true when loading has exceeded threshold (page may be stuck). */
export function usePageStuck(loading: boolean, thresholdMs = 5000): boolean {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsStuck(false);
      return;
    }
    const t = setTimeout(() => setIsStuck(true), thresholdMs);
    return () => clearTimeout(t);
  }, [loading, thresholdMs]);

  return isStuck;
}
