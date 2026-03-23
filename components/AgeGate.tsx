"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "age-gate-verified";

export default function AgeGate() {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setVerified(stored === "yes");
  }, []);

  const handleYes = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "yes");
      setVerified(true);
    }
  };

  const handleNo = () => {
    if (typeof window !== "undefined") {
      window.location.href = "https://www.google.com";
    }
  };

  if (verified === null) return null;
  if (verified) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl md:p-8">
        <div className="mb-6 text-center">
          <p className="font-bangla text-sm font-medium uppercase tracking-wider text-white/60">
            সতর্কতা
          </p>
          <div id="age-gate-title" className="font-bangla mt-2 text-xl font-bold text-white md:text-2xl">
            আপনার বয়স কি ১৮ বছরের উপরে?
          </div>
        </div>

        <p className="font-bangla mb-6 text-center text-sm leading-relaxed text-white/70">
          এই সাইট শুধুমাত্র প্রাপ্তবয়স্কদের জন্য। নিরাপদ থাকতে VPN ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleYes}
            className="font-bangla w-full rounded-xl border-2 border-[var(--primary)] bg-[var(--primary)]/20 py-3.5 text-base font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/30"
          >
            হ্যাঁ, আমি ১৮ বছরের উপরে
          </button>
          <button
            type="button"
            onClick={handleNo}
            className="font-bangla w-full rounded-xl border border-white/20 bg-white/5 py-3.5 text-sm text-white/70 transition-colors hover:bg-white/10"
          >
            না, আমি বের হয়ে যাচ্ছি
          </button>
        </div>

        <p className="font-bangla mt-6 text-center text-xs text-white/50">
          VPN ব্যবহার করে আপনার নিরাপত্তা আরও ভালো রাখুন
        </p>
      </div>
    </div>
  );
}
