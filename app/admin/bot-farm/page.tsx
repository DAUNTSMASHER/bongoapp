"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface BotStats {
  revenue: number;
  cpm: number;
  impressions: number;
  activeBots: number;
  status: "running" | "idle" | "loading";
}

export default function BotFarmDashboard() {
  const [stats, setStats] = useState<BotStats>({
    revenue: 0,
    cpm: 0,
    impressions: 0,
    activeBots: 0,
    status: "loading",
  });
  const [logs, setLogs] = useState<string[]>(["[System] Initializing Dashboard..."]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch Real-time Stats
  const refreshStats = async () => {
    try {
      const res = await fetch("/api/admin/bot-farm/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Stats refresh failed");
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 30000); // 30s Refresh
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: "start" | "stop") => {
    setIsProcessing(true);
    addLog(`[System] Sending ${action.toUpperCase()} command to farm...`);
    
    try {
      const res = await fetch("/api/admin/bot-farm/control", {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      addLog(`[System] ${data.message}`);
      await refreshStats();
    } catch (e) {
      addLog(`[Error] Command failed to execute.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <AdminPageHeader
        title="10x ROI Bot Farm Control"
        description="Monitor real-time revenue and manage Android automation workers."
        backHref="/admin/dashboard"
        backLabel="Dashboard"
      />

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* 🔥 Bot Status Badge */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 animate-pulse rounded-full ${stats.status === "running" ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500"}`} />
            <h2 className="text-xl font-bold tracking-tight uppercase">
              Farm Status: <span className={stats.status === "running" ? "text-green-400" : "text-red-400"}>{stats.status}</span>
            </h2>
          </div>
          <div className="text-sm text-white/40">
            {stats.activeBots} Active Android Instances Detected
          </div>
        </div>

        {/* 📊 Live Revenue Metrics */}
        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all hover:border-green-500/50 hover:bg-white/[0.05]">
            <div className="absolute -right-4 -top-4 text-6xl opacity-10 transition-transform group-hover:scale-110">💰</div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">Today's Revenue</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">${stats.revenue.toFixed(3)}</span>
              <span className="text-sm text-green-400 font-medium">+10x ROI Target</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all hover:border-blue-500/50 hover:bg-white/[0.05]">
            <div className="absolute -right-4 -top-4 text-6xl opacity-10 transition-transform group-hover:scale-110">📈</div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">Active CPM</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">${stats.cpm.toFixed(2)}</span>
              <span className="text-sm text-blue-400 font-medium">Live Rate</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all hover:border-purple-500/50 hover:bg-white/[0.05]">
            <div className="absolute -right-4 -top-4 text-6xl opacity-10 transition-transform group-hover:scale-110">👀</div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">Impressions</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{stats.impressions.toLocaleString()}</span>
              <span className="text-sm text-purple-400 font-medium">Bot Views</span>
            </div>
          </div>
        </div>

        {/* 🎮 Master Control */}
        <div className="mb-12 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent p-10 text-center shadow-2xl">
          <h3 className="mb-2 text-2xl font-bold">Elite Control Core</h3>
          <p className="mb-8 text-white/50">One-click deployment of the full 7-instance automation farm.</p>
          
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            {stats.status !== "running" ? (
              <button
                disabled={isProcessing}
                onClick={() => handleAction("start")}
                className="relative h-16 w-full max-w-xs overflow-hidden rounded-xl bg-green-600 font-bold transition-all hover:bg-green-500 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                {isProcessing ? "INITIALIZING..." : "🚀 LAUNCH 10X FARM"}
              </button>
            ) : (
              <button
                disabled={isProcessing}
                onClick={() => handleAction("stop")}
                className="h-16 w-full max-w-xs rounded-xl bg-red-600/20 border border-red-500/50 text-red-500 font-bold transition-all hover:bg-red-600/30 active:scale-95 disabled:opacity-50"
              >
                🛑 STOP ALL WORKERS
              </button>
            )}
          </div>
        </div>

        {/* 📋 Live Logs Feed */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/30">Live Worker Logic Feed</h4>
            <div className="h-64 overflow-y-auto space-y-2 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className={log.includes("[Error]") ? "text-red-400" : "text-white/40"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/30">System Integrity</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>ADB Connection</span>
                <span className="text-green-400 font-bold">STABLE</span>
              </li>
              <li className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Residential Proxies</span>
                <span className="text-blue-400 font-bold">20 LOADED</span>
              </li>
              <li className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Dwell Time Logic</span>
                <span className="text-purple-400 font-bold">ELITE (V22)</span>
              </li>
              <li className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Auto-Maintenance</span>
                <span className="text-yellow-400 font-bold italic">ENABLED (4H Cycle)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
