/**
 * EffectiveGateCPM ad script URLs. Loaded in AdSlot, BannerAd, and video-click interstitial.
 */

export const AD_SCRIPTS = [
  "https://pl28868889.effectivegatecpm.com/a5/4d/29/a54d29b3db00d91e488dcab4d2374e82.js",
  "https://pl28868917.effectivegatecpm.com/7f/6e/f0/7f6ef087b897f1886ecd99ff0ca97aaf.js",
] as const;

export function loadAllAdScripts() {
  if (typeof document === "undefined") return;
  AD_SCRIPTS.forEach((src, i) => {
    const id = `effectivegatecpm-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  });
}
