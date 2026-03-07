"use client";

import Link from "next/link";

interface AdminLoadingScreenProps {
  message: string;
  showLoginLink?: boolean;
}

/**
 * Stable loading/redirect screen. Message stays visible.
 */
export default function AdminLoadingScreen({ message, showLoginLink }: AdminLoadingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#141414] px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-[var(--primary)]" />
      <p className="text-center text-lg text-white/90">{message}</p>
      <p className="text-center text-sm text-white/50">Please wait...</p>
      {showLoginLink && (
        <Link
          href="/admin/login/"
          className="mt-4 text-sm text-primary underline hover:no-underline"
        >
          Having trouble? Go to admin login
        </Link>
      )}
    </div>
  );
}
