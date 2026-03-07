"use client";

import Link from "next/link";
import { useAuth, signInWithGoogle } from "@/hooks/useAuth";

export default function ArchiveGuard({ children }: { children: React.ReactNode }) {
  const { canUseArchive, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  if (!canUseArchive) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <p className="font-bangla mb-4 text-amber-200">
          আর্কাইভ ব্যবহার করতে Google দিয়ে সাইন ইন করুন।
        </p>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="rounded-lg bg-white px-5 py-2.5 font-semibold text-gray-900 hover:bg-gray-100"
        >
          Sign in with Google
        </button>
        <p className="font-bangla mt-4 text-sm text-white/50">
          <Link href="/profile/" className="text-[var(--primary)] hover:underline">
            Profile
          </Link>{" "}
          থেকে সাইন ইন করতে পারেন।
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
