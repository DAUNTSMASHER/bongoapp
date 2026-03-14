"use client";

import Link from "next/link";
import { formatBanglaCount } from "@/lib/banglaNumbers";

interface HomeStatsProps {
  storyCount?: number;
  videoCount?: number;
}

export default function HomeStats({ storyCount = 1000, videoCount = 1000 }: HomeStatsProps) {
  return (
    <div className="netflix-section rounded-lg p-5 md:p-6">
      <h3 className="mb-4 font-bangla text-sm font-semibold uppercase tracking-wider text-white/70">
        আমাদের সংগ্রহ
      </h3>
      <div className="space-y-3">
        <Link
          href="/categories"
          className="flex items-center gap-4 rounded-md border border-white/10 bg-transparent px-4 py-3.5 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
        >
          <span className="font-bangla text-4xl font-bold tabular-nums text-white md:text-5xl">
            {formatBanglaCount(storyCount)}
          </span>
          <div>
            <p className="font-bangla text-sm font-medium text-white">বাংলা চটি গল্প</p>
            <p className="font-bangla text-xs text-white/60">সকল ক্যাটাগরি</p>
          </div>
        </Link>
        <Link
          href="/videos"
          className="flex items-center gap-4 rounded-md border border-white/10 bg-transparent px-4 py-3.5 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
        >
          <span className="font-bangla text-4xl font-bold tabular-nums text-white md:text-5xl">
            {formatBanglaCount(videoCount)}
          </span>
          <div>
            <p className="font-bangla text-sm font-medium text-white">বাংলা পর্ন ভিডিও</p>
            <p className="font-bangla text-xs text-white/60">হট ভিডিও কালেকশন</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
