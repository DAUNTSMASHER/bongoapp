"use client";

import { useState, Suspense } from "react";
import AdminShell from "@/components/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PlayIcon, BarChartIcon } from "@/components/icons";

const COUNTRIES = [
  { label: "All Countries (Rotate)", value: "" },
  { label: "USA", value: "US" },
  { label: "Canada", value: "CA" },
  { label: "UAE", value: "AE" },
  { label: "France", value: "FR" },
];

export default function LoadTestPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading Admin...</div>}>
      <LoadTestContent />
    </Suspense>
  );
}

function LoadTestContent() {
  const [totalViews, setTotalViews] = useState(50);
  const [storyDuration, setStoryDuration] = useState(10); // in seconds
  const [selectedCountry, setSelectedCountry] = useState("");
  const [headless, setHeadless] = useState(true);
  const [concurrency, setConcurrency] = useState(10);
  const [adsPerBot, setAdsPerBot] = useState(1);
  const [jobDuration, setJobDuration] = useState(0); // in minutes
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleStartTest = async () => {
    setLoading(true);
    setStatus("Starting simulation...");
    try {
      const res = await fetch("/api/admin/load-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalViews,
          storyDuration: storyDuration * 1000,
          selectedCountry,
          headless,
          concurrency,
          adsPerBot,
          jobDuration,
          targetUrl: "https://www.bongochoti.com/"
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("🚀 Simulation started in the background! Check Google Analytics Realtime.");
      } else {
        setStatus("❌ Failed to start: " + data.error);
      }
    } catch (err) {
      setStatus("❌ Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="p-6 md:p-10">
        <AdminPageHeader
          title="Load Testing & GA Simulation"
          description="Simulate human-like visitors to verify Google Analytics and Ad performance."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <AdminCard title="Simulation Configuration">
            <div className="space-y-6 pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Total Bots (Sessions)
                </label>
                <input
                  type="number"
                  value={totalViews}
                  onChange={(e) => setTotalViews(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Story Reading Duration (Seconds per bot)
                </label>
                <input
                  type="number"
                  value={storyDuration}
                  onChange={(e) => setStoryDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Concurrency (Simultaneous Bots)
                </label>
                <input
                  type="number"
                  value={concurrency}
                  min={1}
                  max={50}
                  onChange={(e) => setConcurrency(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--primary)]"
                />
                <p className="mt-2 text-xs text-white/40">
                  Higher concurrency creates a bigger spike in GA4 Realtime stats.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Ads to Click per Bot
                </label>
                <input
                  type="number"
                  value={adsPerBot}
                  min={0}
                  max={5}
                  onChange={(e) => setAdsPerBot(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Total Job Time (Minutes)
                </label>
                <input
                  type="number"
                  value={jobDuration}
                  min={0}
                  onChange={(e) => setJobDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--primary)]"
                />
                <p className="mt-2 text-xs text-white/40">
                  Set to 0 to run as fast as possible. Use for steady traffic distribution.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Target Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--primary)]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-white/40">
                  Note: Accurate country reporting requires a stable proxy pool (configured in scripts).
                </p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-3 text-sm font-medium text-white/70">
                  <input
                    type="checkbox"
                    checked={!headless}
                    onChange={(e) => setHeadless(!e.target.checked)}
                    className="h-5 w-5 rounded border-white/10 bg-white/5 text-[var(--primary)] outline-none"
                  />
                  Visible Browsers (Act like physical phone visit)
                </label>
                <p className="mt-2 text-xs text-white/40">
                  ⚠️ Visible mode is much slower and uses more RAM. It will run 1 bot at a time.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleStartTest}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <PlayIcon size={20} />
                )}
                Run Simulation
              </button>

              {status && (
                <div className={`rounded-lg p-4 text-sm ${status.includes('🚀') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {status}
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard title="Monitoring Instructions">
            <div className="space-y-4 pt-4 text-sm leading-relaxed text-white/60">
              <p>
                To verify the simulation, open your <span className="text-white">Google Analytics Realtime</span> dashboard.
              </p>
              <ul className="list-disc space-y-2 pl-4">
                <li>Check the <span className="text-white">Active Users</span> count.</li>
                <li>Check the <span className="text-white">Page Title and Screen Class</span> report for multiple pageviews per user.</li>
                <li>Verify <span className="text-white">Events</span> like "page_view" and "user_engagement".</li>
              </ul>
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-white/5 p-4">
                <BarChartIcon className="text-[var(--primary)]" size={24} />
                <div>
                  <p className="font-semibold text-white">GA Measurement ID</p>
                  <p className="text-xs font-mono">G-T51ZDP5989</p>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminShell>
  );
}
