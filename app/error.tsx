"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console / monitoring in production
    console.error("Application error:", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="font-bangla text-xl font-bold text-white md:text-2xl">
        কিছু একটা ভুল হয়েছে
      </h1>
      <p className="font-bangla mt-3 text-center text-sm text-white/70">
        পেজ লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="font-bangla rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          আবার চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="font-bangla rounded-md border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]"
        >
          হোম পেজে যান
        </Link>
      </div>
    </div>
  );
}
