/**
 * Ad scripts and Smart Links — Cardinal Tangible / Adsterra.
 * Disabled when ADS_ENABLED=false.
 */

import { ADS_ENABLED } from "./adPlacementConfig";

/** Main ad script — Cardinal Tangible */
export const AD_SCRIPTS = [
  "https://cardinaltangible.com/a5/4d/29/a54d29b3db00d91e488dcab4d2374e82.js",
] as const;

/** Smart Link URLs (zone: smart-link-2961177) — rotates by placement for balanced coverage */
export const SMART_LINKS = [
  "https://cardinaltangible.com/fu3mudeq?key=48bce8b7a76951edf18c33068c9f30ce",
  "https://cardinaltangible.com/cenmac1xiu?key=f3f3f056f6fe45a6842a4db16b2b086e",
  "https://cardinaltangible.com/h3pkdr0pg?key=c20accdcf535163852a0672375f32b47",
  "https://cardinaltangible.com/raq2v9v6ag?key=2fa77928d8c0d24cd30a83b4f22f24e5",
] as const;

/** Get a smart link URL for a placement (round-robin for balance) */
export function getSmartLinkUrl(placement: string): string {
  const hash = placement.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SMART_LINKS[hash % SMART_LINKS.length];
}

/** Invoke ad (container-based): pl28868975 */
export const INVOKE_AD = {
  scriptInvoke:
    "https://pl28868975.effectivegatecpm.com/3ff28b7bb816b0476de00d1ae221cefe/invoke.js",
  containerId: "container-3ff28b7bb816b0476de00d1ae221cefe",
} as const;

export function loadAllAdScripts() {
  if (!ADS_ENABLED || typeof document === "undefined") return;
  AD_SCRIPTS.forEach((src, i) => {
    const id = `cardinal-ad-${i}`;
    if (document.getElementById(id) || document.getElementById("cardinal-pop-ad")) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);
  });
}

export function loadInvokeAd() {
  if (!ADS_ENABLED || typeof document === "undefined") return;
  const id = "effectivegatecpm-invoke";
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.src = INVOKE_AD.scriptInvoke;
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  document.body.appendChild(script);
}

/** Acidic-deal: DISABLED. */
export function loadAcidicDealAd() {
  /* no-op */
}
