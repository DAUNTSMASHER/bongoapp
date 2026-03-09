/**
 * Ad scripts. Loaded in AdSlot, BannerAd, video/story interstitials.
 */

export const AD_SCRIPTS = [
  "https://pl28868889.effectivegatecpm.com/a5/4d/29/a54d29b3db00d91e488dcab4d2374e82.js",
  "https://pl28868917.effectivegatecpm.com/7f/6e/f0/7f6ef087b897f1886ecd99ff0ca97aaf.js",
] as const;

/** Acidic-deal / illinformed-summer ad script */
const ACIDIC_DEAL_SCRIPT =
  "https://illinformed-summer.com/bkX.VMs/dmGalh0IYqWpcY/ve/m/9QudZjU/lrkAPjT/Y/4dNJDKk/5jNwDMkltHN/jagO0-O/T/kq1AMrwd";

/** Invoke ad (container-based): pl28868975 */
export const INVOKE_AD = {
  scriptInvoke:
    "https://pl28868975.effectivegatecpm.com/3ff28b7bb816b0476de00d1ae221cefe/invoke.js",
  containerId: "container-3ff28b7bb816b0476de00d1ae221cefe",
} as const;

export function loadAllAdScripts() {
  if (typeof document === "undefined") return;
  AD_SCRIPTS.forEach((src, i) => {
    const id = `effectivegatecpm-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);
  });
  loadAcidicDealAd();
}

export function loadInvokeAd() {
  if (typeof document === "undefined") return;
  const id = "effectivegatecpm-invoke";
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.src = INVOKE_AD.scriptInvoke;
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  document.body.appendChild(script);
}

/** Load acidic-deal/illinformed-summer ad script (inject once) */
export function loadAcidicDealAd() {
  if (typeof document === "undefined") return;
  const id = "acidic-deal-ad";
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  (script as HTMLScriptElement & { settings?: object }).settings = {};
  script.src = ACIDIC_DEAL_SCRIPT;
  script.async = true;
  script.referrerPolicy = "no-referrer-when-downgrade";
  document.body.appendChild(script);
}
