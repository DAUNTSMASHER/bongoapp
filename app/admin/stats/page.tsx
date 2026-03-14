"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

interface DailyRow {
  date: string;
  pageViews: number;
  clicks: number;
}

interface AnalyticsData {
  daily: DailyRow[];
  totals: { pageViews: number; clicks: number };
}

interface AdsterraRow {
  date?: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  revenue?: number;
}

export default function AdminStatsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [adsterraStats, setAdsterraStats] = useState<AdsterraRow[]>([]);
  const [adsterraLoading, setAdsterraLoading] = useState(true);
  const [adsterraError, setAdsterraError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAnalytics(data);
      })
      .catch((e) => setAnalyticsError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setAnalyticsLoading(false));
  }, [days]);

  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const finish = new Date();
    const startStr = start.toISOString().slice(0, 10);
    const finishStr = finish.toISOString().slice(0, 10);
    fetch(`/api/admin/adsterra-stats?start=${startStr}&finish=${finishStr}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAdsterraStats(data.stats || []);
      })
      .catch(() => setAdsterraError("Adsterra API not configured"))
      .finally(() => setAdsterraLoading(false));
  }, []);

  const today = analytics?.daily[analytics.daily.length - 1];
  const last7 = analytics?.daily.slice(-7).reduce((a, r) => a + r.pageViews, 0) ?? 0;
  const maxViews = Math.max(1, ...(analytics?.daily.map((r) => r.pageViews) ?? [1]));

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Website Statistics"
        description="Daily visits, page views, clicks, and performance metrics"
        backHref="/admin/dashboard/"
        backLabel="Dashboard"
      />
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">

      {/* Custom analytics */}
      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Daily visits (custom)</h2>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {analyticsLoading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
            Loading…
          </div>
        )}
        {analyticsError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {analyticsError}
          </div>
        )}
        {analytics && !analyticsLoading && !analyticsError && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-wider text-white/50">Today</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {today?.pageViews ?? 0} <span className="text-base font-normal text-white/60">views</span>
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-wider text-white/50">Last 7 days</p>
                <p className="mt-1 text-2xl font-bold text-white">{last7}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-wider text-white/50">Total ({days} days)</p>
                <p className="mt-1 text-2xl font-bold text-white">{analytics.totals.pageViews}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="mb-4 text-sm font-medium text-white/80">Daily page views</p>
              <div className="flex items-end gap-1">
                {analytics.daily.map((row) => (
                  <div
                    key={row.date}
                    className="flex flex-1 flex-col items-center gap-1"
                    title={`${row.date}: ${row.pageViews} views`}
                  >
                    <div
                      className="w-full min-w-[4px] rounded-t transition-all"
                      style={{
                        height: `${Math.max(4, (row.pageViews / maxViews) * 120)}px`,
                        backgroundColor: "var(--primary)",
                        opacity: 0.9,
                      }}
                    />
                    <span className="text-[10px] text-white/50">{row.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-2 text-left text-white/70">Date</th>
                    <th className="px-4 py-2 text-right text-white/70">Page views</th>
                    <th className="px-4 py-2 text-right text-white/70">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {[...analytics.daily].reverse().map((row) => (
                    <tr key={row.date} className="border-b border-white/5">
                      <td className="px-4 py-2 text-white">{row.date}</td>
                      <td className="px-4 py-2 text-right text-white">{row.pageViews}</td>
                      <td className="px-4 py-2 text-right text-white">{row.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="mt-3 text-xs text-white/40">
          Custom tracking via /api/analytics/track. Page views are recorded on each visit.
        </p>
      </section>

      {/* Adsterra stats */}
      {!adsterraLoading && adsterraStats.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-white">Adsterra (last 7 days)</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-2 text-left text-white/70">Date</th>
                  <th className="px-4 py-2 text-right text-white/70">Impressions</th>
                  <th className="px-4 py-2 text-right text-white/70">Clicks</th>
                  <th className="px-4 py-2 text-right text-white/70">CTR</th>
                  <th className="px-4 py-2 text-right text-white/70">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {adsterraStats.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-4 py-2 text-white">{row.date ?? "—"}</td>
                    <td className="px-4 py-2 text-right text-white">{row.impressions ?? 0}</td>
                    <td className="px-4 py-2 text-right text-white">{row.clicks ?? 0}</td>
                    <td className="px-4 py-2 text-right text-white">{row.ctr != null ? `${row.ctr}%` : "—"}</td>
                    <td className="px-4 py-2 text-right text-white">${row.revenue ?? "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {adsterraError && (
        <p className="mb-8 text-xs text-white/40">
          Adsterra: {adsterraError}. Set ADSTERRA_API_TOKEN to show ad stats.
        </p>
      )}

      {/* Third-party dashboards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">External dashboards</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-[var(--primary)] hover:bg-white/10"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-semibold text-white">Google Analytics 4</h3>
            </div>
            <p className="mb-4 text-sm text-white/70">
              Real-time users, sessions, page views, bounce rate, traffic sources.
            </p>
            <span className="inline-block text-sm font-medium text-[var(--primary)]">Open GA4 →</span>
          </a>

          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-[var(--primary)] hover:bg-white/10"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl">▲</span>
              <h3 className="text-lg font-semibold text-white">Vercel Analytics</h3>
            </div>
            <p className="mb-4 text-sm text-white/70">
              Web Vitals, page views, and deployment analytics.
            </p>
            <span className="inline-block text-sm font-medium text-[var(--primary)]">Open Vercel →</span>
          </a>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-[var(--primary)] hover:bg-white/10"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <h3 className="text-lg font-semibold text-white">Google Search Console</h3>
            </div>
            <p className="mb-4 text-sm text-white/70">
              Clicks, impressions, indexing, search performance.
            </p>
            <span className="inline-block text-sm font-medium text-[var(--primary)]">Open Search Console →</span>
          </a>

          {gaId && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <h3 className="text-lg font-semibold text-white">GA4 Connected</h3>
              </div>
              <p className="text-sm text-white/70">
                ID: <code className="rounded bg-white/10 px-1">{gaId}</code>
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-2 text-sm font-semibold text-white">Quick links</h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li>
            <a
              href={`https://analytics.google.com/analytics/web/#/p?n=default&fid=${gaId || ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              GA4 Real-time report
            </a>
          </li>
          <li>
            <a
              href={`https://search.google.com/search-console?resource_id=sc_domain:${siteUrl.replace(/^https?:\/\//, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              Search Console (domain)
            </a>
          </li>
        </ul>
      </div>
      </div>
    </div>
  );
}
