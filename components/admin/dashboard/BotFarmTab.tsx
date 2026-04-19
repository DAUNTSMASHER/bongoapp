"use client";

import Link from "next/link";

export function BotFarmTab() {
  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent p-10 text-center shadow-2xl">
      <div className="mb-6 flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10 text-6xl shadow-[0_0_50px_rgba(34,197,94,0.1)]">
          💎
        </div>
      </div>
      
      <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">Elite 10x ROI Bot Farm</h2>
      <p className="mx-auto mb-10 max-w-lg text-lg text-white/50">
        Your Android automation farm is now running. Visit the Command Center to monitor real-time Adsterra revenue, CPM, and worker health.
      </p>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/admin/bot-farm"
          className="group relative flex h-14 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl bg-green-600 font-bold transition-all hover:bg-green-500 hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          🚀 ENTER COMMAND CENTER
        </Link>
        <p className="text-sm text-white/40">
          7 Parallel Instances Active
        </p>
      </div>
    </div>
  );
}
