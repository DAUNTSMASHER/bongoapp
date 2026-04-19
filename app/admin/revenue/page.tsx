"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { BarChartIcon, BackIcon } from "@/components/icons";

interface AdsterraItem {
  placement: number;
  impression: number;
  clicks: number;
  ctr: number;
  cpm: number;
  revenue: number;
}

export default function RevenueDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Initializing Revenue Dashboard...</div>}>
      <AdminShell>
        <RevenueContent />
      </AdminShell>
    </Suspense>
  );
}

function RevenueContent() {
  const [data, setData] = useState<AdsterraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/adsterra-stats");
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json.items || []);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 60s
    return () => clearInterval(interval);
  }, []);

  const totals = data.reduce(
    (acc, curr) => ({
      impression: acc.impression + curr.impression,
      clicks: acc.clicks + curr.clicks,
      revenue: acc.revenue + (typeof curr.revenue === "number" ? curr.revenue : parseFloat(curr.revenue as any || "0")),
    }),
    { impression: 0, clicks: 0, revenue: 0 }
  );

  const avgCpm = totals.impression > 0 ? (totals.revenue / totals.impression) * 1000 : 0;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Live <span className="text-[var(--primary)]">Revenue</span>
          </h1>
          <p className="mt-1 text-sm text-white/40 font-medium uppercase tracking-wider">Real-time Adsterra Performance</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex px-4 py-2 border-r border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Last Updated</span>
            <span className="font-mono text-xs text-[var(--primary)] font-bold">{lastUpdated || "Syncing..."}</span>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatItem
          label="Today's Revenue"
          value={`$${totals.revenue.toFixed(3)}`}
          sub="Live Earnings"
          color="text-green-400"
        />
        <StatItem
          label="Impressions"
          value={totals.impression.toLocaleString()}
          sub="Verified Loads"
          color="text-blue-400"
        />
        <StatItem
          label="Clicks"
          value={totals.clicks.toLocaleString()}
          sub="Success Actions"
          color="text-purple-400"
        />
        <StatItem
          label="Avg. CPM"
          value={`$${avgCpm.toFixed(2)}`}
          sub="Per 1,000 Views"
          color="text-orange-400"
        />
      </div>

      {/* Breakdown Table */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
        <div className="border-b border-white/5 bg-white/[0.02] px-6 py-4 flex items-center justify-between">
           <h3 className="text-sm font-bold text-white/80">Placement Breakdown</h3>
           <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-white/30">v17 Stealth Active</span>
           </div>
        </div>
        
        {loading && data.length === 0 ? (
          <div className="py-20 text-center italic text-white/20">Awaiting data from Adsterra API...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 border border-red-500/10 m-4 rounded-xl bg-red-500/5">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 font-bold">Zone / Placement</th>
                  <th className="px-6 py-4 font-bold text-right">Imps</th>
                  <th className="px-6 py-4 font-bold text-right">Clicks</th>
                  <th className="px-6 py-4 font-bold text-right">CTR</th>
                  <th className="px-6 py-4 font-bold text-right">CPM</th>
                  <th className="px-6 py-4 font-bold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {data.map((item) => (
                  <tr key={item.placement} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 text-white/70 group-hover:text-white">{item.placement}</td>
                    <td className="px-6 py-4 text-right tabular-nums">{item.impression.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right tabular-nums">{item.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right tabular-nums">{item.ctr}%</td>
                    <td className="px-6 py-4 text-right tabular-nums text-white/50">${item.cpm}</td>
                    <td className="px-6 py-4 text-right tabular-nums font-bold text-[var(--primary)]">${item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Help Link */}
      <div className="mt-8 flex justify-center">
        <span className="text-xs text-white/20">
            Traffic simulation is currently active in local mode.
        </span>
      </div>
    </div>
  );
}

function StatItem({ label, value, sub, color }: any) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all">
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{label}</div>
      <div className={`text-2xl font-black tabular-nums ${color}`}>{value}</div>
      <div className="mt-1 text-[10px] text-white/20 font-medium">{sub}</div>
    </div>
  );
}
