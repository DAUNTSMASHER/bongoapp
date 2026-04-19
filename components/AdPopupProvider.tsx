"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadAllAdScripts, loadInvokeAd, INVOKE_AD } from "@/lib/ads";
import { canShowAd, recordAdShown } from "@/lib/adRateLimit";
import { ADS_ENABLED, POPUP_VIEW_SECONDS } from "@/lib/adPlacementConfig";

const AD_VIEW_SECONDS = POPUP_VIEW_SECONDS;

interface AdPopupContextValue {
  showAdThenNavigate: (href: string, openInNewTab?: boolean) => void;
}

const AdPopupContext = createContext<AdPopupContextValue | null>(null);

export function useAdPopup() {
  const ctx = useContext(AdPopupContext);
  return ctx;
}

function doNavigate(href: string, openInNewTab: boolean, router: ReturnType<typeof useRouter>) {
  if (openInNewTab) {
    window.open(href, "_blank", "noopener,noreferrer");
  } else {
    router.push(href);
  }
}

/** Internal link? Exclude admin, external, and skip-ad links. */
function isInternalLinkToIntercept(href: string, el: HTMLAnchorElement): boolean {
  if (!href || href.startsWith("#") || el.target === "_blank" || el.hasAttribute("data-skip-ad")) return false;
  const path = href.startsWith("/") ? href : new URL(href, window.location.origin).pathname;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("/admin")) return false;
  return true;
}

export function AdPopupProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, setPending] = useState<{ href: string; openInNewTab: boolean } | null>(null);
  const [countdown, setCountdown] = useState(AD_VIEW_SECONDS);
  const [canContinue, setCanContinue] = useState(false);

  const showAdThenNavigate = useCallback((href: string, openInNewTab = false) => {
    if (!canShowAd()) {
      doNavigate(href, openInNewTab, router);
      return;
    }
    recordAdShown();
    loadAllAdScripts();
    loadInvokeAd(INVOKE_AD.key);
    setPending({ href, openInNewTab });
    setCountdown(AD_VIEW_SECONDS);
    setCanContinue(false);
  }, [router]);

  // Global: intercept internal link clicks to show ad before navigate
  useEffect(() => {
    if (!ADS_ENABLED) return;
    const handler = (e: MouseEvent) => {
      if (pending) return;
      const target = (e.target as HTMLElement)?.closest?.("a");
      if (!target || target.tagName !== "A") return;
      const href = target.getAttribute("href");
      if (!href) return;
      if (!isInternalLinkToIntercept(href, target)) return;
      e.preventDefault();
      e.stopPropagation();
      const path = href.startsWith("/") ? href : new URL(href, window.location.origin).pathname;
      showAdThenNavigate(path, false);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [showAdThenNavigate, pending]);

  useEffect(() => {
    if (!pending) return;
    if (countdown <= 0) {
      setCanContinue(true);
      doNavigate(pending.href, pending.openInNewTab, router);
      setPending(null);
      setCountdown(AD_VIEW_SECONDS);
      return;
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [pending, countdown, router]);

  const handleDismiss = useCallback(() => {
    if (!pending || !canContinue) return;
    doNavigate(pending.href, pending.openInNewTab, router);
    setPending(null);
    setCanContinue(false);
  }, [pending, canContinue, router]);

  return (
    <AdPopupContext.Provider value={{ showAdThenNavigate }}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal
          aria-label="Advertisement"
        >
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="h-2 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#E50914] transition-all duration-1000"
                style={{ width: `${((AD_VIEW_SECONDS - countdown) / AD_VIEW_SECONDS) * 100}%` }}
              />
            </div>
            <p className="font-bangla text-sm font-medium text-white">
              {countdown > 0
                ? `${countdown} সেকেন্ড অপেক্ষা করুন`
                : "চলুন!"}
            </p>
            <p className="font-bangla text-xs text-white/60">
              {countdown > 0 ? "বিজ্ঞাপন দেখুন, তারপর যাবেন" : "যাচ্ছি..."}
            </p>
          </div>
          <div
            id={INVOKE_AD.containerId}
            className="mb-6 min-h-[200px] w-full max-w-lg rounded-lg border border-white/10 bg-transparent"
          />
          <button
            type="button"
            onClick={handleDismiss}
            disabled={countdown > 0}
            className="rounded-lg bg-[#E50914] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {countdown > 0 ? `${countdown} সেকেন্ড অপেক্ষা করুন` : "এখনই যান"}
          </button>
          <p className="font-bangla mt-3 text-xs text-white/50">
            {AD_VIEW_SECONDS} সেকেন্ড পর গল্পে যাবেন
          </p>
        </div>
      )}
    </AdPopupContext.Provider>
  );
}
