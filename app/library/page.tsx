"use client";

import { useState } from "react";

type Tab = "bookmarks" | "history";

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("bookmarks");

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-white">My Library</h1>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("bookmarks")}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            tab === "bookmarks"
              ? "bg-[var(--primary)] text-white"
              : "bg-white/10 text-white/90 hover:bg-white/20"
          }`}
        >
          Bookmarks
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            tab === "history"
              ? "bg-[var(--primary)] text-white"
              : "bg-white/10 text-white/90 hover:bg-white/20"
          }`}
        >
          Recently Viewed
        </button>
      </div>

      {tab === "bookmarks" && (
        <p className="text-white/70">
          Sign in to sync bookmarks. For now, bookmarks are stored locally.
        </p>
      )}
      {tab === "history" && (
        <p className="text-white/70">
          Recently viewed stories will appear here.
        </p>
      )}
    </div>
  );
}
