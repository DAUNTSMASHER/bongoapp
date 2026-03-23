"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminCard } from "@/components/admin/AdminCard";

interface StoryItem {
  id: string;
  title: string;
  coverImageUrl?: string;
  body?: string;
  categorySlug?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.bongochoti.com";

const TELEGRAM_STORAGE_KEY = "bongochoti_telegram_config";

export function MarketingTab() {
  // Telegram config
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [telegramSaved, setTelegramSaved] = useState(false);
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);

  // Stories
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Actions
  const [sending, setSending] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Load saved Telegram config
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TELEGRAM_STORAGE_KEY);
      if (saved) {
        const { botToken: t, chatId: c } = JSON.parse(saved);
        if (t && c) {
          setBotToken(t);
          setChatId(c);
          setTelegramSaved(true);
        }
      }
    } catch {}
  }, []);

  // Load stories
  useEffect(() => {
    fetch("/api/stories?limit=100&status=published")
      .then((r) => r.json())
      .then((data) => {
        setStories(Array.isArray(data.stories) ? data.stories : Array.isArray(data) ? data : []);
      })
      .catch(() => setStories([]))
      .finally(() => setLoadingStories(false));
  }, []);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  function saveTelegramConfig() {
    localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify({ botToken, chatId }));
    setTelegramSaved(true);
    addLog("✅ Telegram config saved locally");
    // Also save to Firestore so cron jobs can use it
    fetch("/api/admin/marketing-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramBotToken: botToken, telegramChatId: chatId, autoPostEnabled }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) addLog("✅ Config synced to server (cron agents active)");
        else addLog("⚠️ Server sync failed: " + d.error);
      })
      .catch((e) => addLog("⚠️ Server sync error: " + e.message));
  }

  function clearTelegramConfig() {
    localStorage.removeItem(TELEGRAM_STORAGE_KEY);
    setBotToken("");
    setChatId("");
    setTelegramSaved(false);
    setAutoPostEnabled(false);
    addLog("Telegram config cleared locally");
    fetch("/api/admin/marketing-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramBotToken: "", telegramChatId: "", autoPostEnabled: false }),
    }).catch(() => {});
  }

  function toggleAutoPost() {
    const newVal = !autoPostEnabled;
    setAutoPostEnabled(newVal);
    fetch("/api/admin/marketing-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoPostEnabled: newVal }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) addLog(newVal ? "🤖 Auto-post ENABLED — agent will post daily" : "Auto-post disabled");
      })
      .catch(() => {});
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === stories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(stories.map((s) => s.id)));
    }
  }

  async function sendToTelegram(story: StoryItem) {
    if (!botToken || !chatId) {
      addLog("❌ Set Telegram Bot Token and Chat ID first");
      return;
    }
    setSending(story.id);
    try {
      const storyUrl = `${SITE_URL}/stories/${story.id}`;
      const res = await fetch("/api/admin/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken,
          chatId,
          title: story.title,
          url: storyUrl,
          coverImageUrl: story.coverImageUrl,
          description: story.body?.slice(0, 200),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        addLog(`✅ Sent to Telegram: "${story.title}"`);
      } else {
        addLog(`❌ Telegram error: ${data.error}`);
      }
    } catch (err) {
      addLog(`❌ Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSending(null);
    }
  }

  async function bulkDistribute() {
    if (selectedIds.size === 0) {
      addLog("Select stories first");
      return;
    }
    setBulkSending(true);
    addLog(`🚀 Distributing ${selectedIds.size} stories...`);

    const selected = stories.filter((s) => selectedIds.has(s.id));
    for (const story of selected) {
      await sendToTelegram(story);
      // Small delay between messages to avoid Telegram rate limits
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Ping Google after bulk distribute
    await pingGoogle();
    setBulkSending(false);
    addLog(`✅ Bulk distribution complete`);
  }

  async function pingGoogle() {
    setPinging(true);
    try {
      const res = await fetch("/api/admin/ping-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitemapUrl: `${SITE_URL}/sitemap.xml` }),
      });
      const data = await res.json();
      if (data.ok) {
        addLog(`✅ Google pinged (status ${data.google?.status})`);
      } else {
        addLog(`❌ Google ping failed: ${data.error}`);
      }
    } catch (err) {
      addLog(`❌ Ping failed: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setPinging(false);
    }
  }

  function getShareUrl(platform: string, story: StoryItem) {
    const storyUrl = encodeURIComponent(`${SITE_URL}/stories/${story.id}`);
    const title = encodeURIComponent(story.title);
    switch (platform) {
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${storyUrl}`;
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${storyUrl}&text=${title}`;
      case "whatsapp":
        return `https://api.whatsapp.com/send?text=${title}%20${storyUrl}`;
      case "reddit":
        return `https://reddit.com/submit?url=${storyUrl}&title=${title}`;
      case "telegram":
        return `https://t.me/share/url?url=${storyUrl}&text=${title}`;
      default:
        return "#";
    }
  }

  return (
    <div className="space-y-6">
      {/* Telegram Setup */}
      <AdminCard
        title="📡 Telegram Channel Setup"
        description="Connect your Telegram Bot to auto-post stories to your channel"
      >
        {telegramSaved ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded bg-green-500/20 px-3 py-1.5 text-sm text-green-400">
                ✅ Telegram connected
              </span>
              <button
                type="button"
                onClick={clearTelegramConfig}
                className="text-sm text-white/50 underline hover:text-white"
              >
                Disconnect
              </button>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <button
                type="button"
                onClick={toggleAutoPost}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  autoPostEnabled ? "bg-green-500" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    autoPostEnabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-medium text-white">
                  🤖 Auto-Post Agent {autoPostEnabled ? "ON" : "OFF"}
                </p>
                <p className="text-xs text-white/50">
                  When ON, new stories are automatically sent to Telegram + Google is pinged daily at 2 PM BDT
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-white/50">
              1. Message <a href="https://t.me/BotFather" target="_blank" rel="noopener" className="text-[var(--primary)] underline">@BotFather</a> on Telegram → /newbot → get your token
              <br />2. Create a channel, add your bot as admin
              <br />3. Chat ID = @yourchannel (or numeric ID like -1001234567890)
            </p>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Bot token (123456:ABC...)"
                className="min-w-[240px] flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none"
              />
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Chat ID (@channel or -100...)"
                className="min-w-[200px] rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={saveTelegramConfig}
                disabled={!botToken.trim() || !chatId.trim()}
                className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          </div>
        )}
      </AdminCard>

      {/* Quick Actions */}
      <AdminCard title="⚡ Quick Actions">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={pingGoogle}
            disabled={pinging}
            className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
          >
            {pinging ? "Pinging…" : "🔔 Ping Google (Sitemap)"}
          </button>
          <button
            type="button"
            onClick={bulkDistribute}
            disabled={bulkSending || selectedIds.size === 0}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {bulkSending
              ? `Sending ${selectedIds.size} stories…`
              : `🚀 Distribute Selected (${selectedIds.size})`}
          </button>
        </div>
      </AdminCard>

      {/* Story List */}
      <AdminCard
        title="📚 Select Stories to Distribute"
        description={loadingStories ? "Loading…" : `${stories.length} published stories`}
      >
        {!loadingStories && stories.length > 0 && (
          <div className="mb-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-sm text-[var(--primary)] underline hover:no-underline"
            >
              {selectedIds.size === stories.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        )}
        <div className="max-h-[500px] space-y-2 overflow-y-auto">
          {stories.map((story) => (
            <div
              key={story.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                selectedIds.has(story.id)
                  ? "border-[var(--primary)]/50 bg-[var(--primary)]/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(story.id)}
                onChange={() => toggleSelect(story.id)}
                className="h-4 w-4 shrink-0 accent-[var(--primary)]"
              />
              {story.coverImageUrl && (
                <img
                  src={story.coverImageUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{story.title}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {telegramSaved && (
                  <button
                    type="button"
                    onClick={() => sendToTelegram(story)}
                    disabled={sending === story.id}
                    className="rounded border border-blue-500/30 px-2.5 py-1 text-xs text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
                    title="Send to Telegram"
                  >
                    {sending === story.id ? "…" : "📨"}
                  </button>
                )}
                <a
                  href={getShareUrl("facebook", story)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-blue-600/30 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-600/20"
                  title="Share on Facebook"
                >
                  FB
                </a>
                <a
                  href={getShareUrl("twitter", story)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-white/20 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10"
                  title="Share on Twitter"
                >
                  𝕏
                </a>
                <a
                  href={getShareUrl("whatsapp", story)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-green-500/30 px-2.5 py-1 text-xs text-green-400 hover:bg-green-500/20"
                  title="Share on WhatsApp"
                >
                  WA
                </a>
                <a
                  href={getShareUrl("reddit", story)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-orange-500/30 px-2.5 py-1 text-xs text-orange-400 hover:bg-orange-500/20"
                  title="Share on Reddit"
                >
                  R
                </a>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Activity Log */}
      {logs.length > 0 && (
        <AdminCard title="📋 Activity Log">
          <div className="max-h-[200px] space-y-1 overflow-y-auto font-mono text-xs">
            {logs.map((log, i) => (
              <p key={i} className="text-white/70">
                {log}
              </p>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
