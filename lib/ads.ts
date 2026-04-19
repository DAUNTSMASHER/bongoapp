/**
 * Ad scripts and Smart Links — Cardinal Tangible / Adsterra.
 * Disabled when ADS_ENABLED=false.
 */

import { ADS_ENABLED } from "./adPlacementConfig";

/** Main ad scripts — Cardinal Tangible / Adsterra */
export const AD_SCRIPTS = [
  "https://cardinaltangible.com/69/54/1c/69541cc12fc159622d707002b73374ab.js", // Social Bar / Popunder
  "https://cardinaltangible.com/15/11/f7/1511f780fc1760a8a7ea2fed510c3c4b.js", // Direct Script
] as const;

/** Native / Banner Script (Shared) */
export const NATIVE_AD_SCRIPT = "https://cardinaltangible.com/b2323302a9af1d5e97a0bfebca4bf561/invoke.js";

/** Smart Link URLs (vmdgf6guj7) */
export const SMART_LINKS = [
  "https://cardinaltangible.com/vmdgf6guj7?key=55e91e34cc30d61292208e44f46db35c",
] as const;

/** Banner Keys by size/format */
export const BANNER_KEYS: Record<string, string> = {
  "160x600": "ae755afa3078d659753edde54c9d02b6",
  "300x250": "52e96d10c1108e5da168aff4f5e20c36",
  "160x300": "d5061be0f244b63717f4780373a19d0e",
  "468x60": "af45fbe6b079eef6df70f546900a06a7",
  "320x50": "ab76de5156a78208acfd842e3e8bdc1b",
  "728x90": "584f6f0261737b63c33b6aa2ec228878",
  "native": "b2323302a9af1d5e97a0bfebca4bf561",
};

/** Specific object for AdPopupProvider and other legacy components */
export const INVOKE_AD = {
  key: BANNER_KEYS["300x250"],
  containerId: `container-${BANNER_KEYS["300x250"]}`,
};

/** Get a smart link URL */
export function getSmartLinkUrl(placement: string): string {
  // Use the newest one primarily
  return SMART_LINKS[0];
}

export function loadAllAdScripts() {
  if (!ADS_ENABLED || typeof document === "undefined") return;
  AD_SCRIPTS.forEach((src, i) => {
    const id = `at-script-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);
  });
}

/** Final Optimized Ad Loaders */
export function loadInvokeAd(key?: string) {
  if (!ADS_ENABLED || typeof document === "undefined") return;
  const targetKey = key || BANNER_KEYS["300x250"];
  const scriptId = `invoke-${targetKey}`;
  if (document.getElementById(scriptId)) return;

  const script = document.createElement("script");
  script.id = scriptId;
  script.src = `//cardinaltangible.com/${targetKey}/invoke.js`;
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  document.body.appendChild(script);
}

export function loadAcidicDealAd() {
  if (!ADS_ENABLED || typeof document === "undefined") return;
  const script = document.createElement("script");
  script.src = "//cardinaltangible.com/a54d29b3dbb60cc9ce162c9677e8ea55/invoke.js";
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  document.body.appendChild(script);
}

export function loadNativeAd(containerId: string) {
  if (!ADS_ENABLED || typeof document === "undefined") return;
}
