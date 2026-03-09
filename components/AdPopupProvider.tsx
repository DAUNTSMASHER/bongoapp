"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadAllAdScripts, loadInvokeAd, INVOKE_AD } from "@/lib/ads";
import { canShowAd, recordAdShown } from "@/lib/adRateLimit";

/** Seconds user must view ad before auto-navigating */
const AD_VIEW_SECONDS = 10;

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
    loadInvokeAd();
    setPending({ href, openInNewTab });
    setCountdown(AD_VIEW_SECONDS);
    setCanContinue(false);
  }, [router]);

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
            <div className="h-2 w-48 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-[var(--primary)] transition-all duration-1000"
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
            className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
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
