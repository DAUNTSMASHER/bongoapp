/**
 * Rate limit ads: max MAX_ADS_PER_MINUTE in any 60-second window.
 * Used for interstitials (popup ads) to avoid overwhelming users.
 * Research: 3/min balances revenue vs. bounce/return intent.
 */

import { POPUP_MAX_PER_MINUTE } from "./adPlacementConfig";

const WINDOW_MS = 60_000; // 1 minute
const MAX_ADS_PER_MINUTE = POPUP_MAX_PER_MINUTE;

const timestamps: number[] = [];

/** Returns true if we can show another ad (under limit) */
export function canShowAd(): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const recent = timestamps.filter((t) => t > cutoff);
  return recent.length < MAX_ADS_PER_MINUTE;
}

/** Call when an ad is shown. Returns false if over limit (caller should skip ad). */
export function recordAdShown(): boolean {
  if (!canShowAd()) return false;
  const now = Date.now();
  timestamps.push(now);
  const cutoff = now - WINDOW_MS;
  while (timestamps.length > 0 && timestamps[0] <= cutoff) {
    timestamps.shift();
  }
  return true;
}
