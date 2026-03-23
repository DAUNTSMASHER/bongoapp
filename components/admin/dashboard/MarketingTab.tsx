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
  const [googleConnected, setGoogleConnected] = useState(false);

  // Stories
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Actions
  const [sending, setSending] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
        if (d.googleConnected !== undefined) setGoogleConnected(d.googleConnected);
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
 
  async function connectGoogle() {
    try {
      const res = await fetch("/api/admin/google-auth");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        addLog("❌ Failed to get Google auth URL");
      }
    } catch (err) {
      addLog("❌ Error: " + (err instanceof Error ? err.message : "Auth failed"));
    }
  }
 
  function disconnectGoogle() {
    fetch("/api/admin/marketing-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleRefreshToken: null }),
    }).then(() => {
      setGoogleConnected(false);
      addLog("Google account disconnected");
    });
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

    // Submit to search engines after bulk distribute
    await submitToSearchEngines();
    setBulkSending(false);
    addLog(`✅ Bulk distribution complete`);
  }

  async function submitToSearchEngines() {
    setSubmitting(true);
    addLog("🔎 Submitting to search engines (Google + Bing + Yahoo)...");
    try {
      const res = await fetch("/api/admin/submit-to-search-engines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sitemap" }),
      });
      const data = await res.json();
      
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((r: any) => {
          addLog(`${r.ok ? "✅" : "❌"} ${r.engine}: ${r.status}${r.detail ? " (" + r.detail + ")" : ""}`);
        });
      }

      if (data.ok) {
        addLog("🚀 All search engines notified successfully!");
      } else {
        addLog("⚠️ Some search engine submissions failed (check logs above)");
      }
    } catch (err) {
      addLog(`❌ Search engine submission failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSubmitting(false);
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
                  When ON, new stories are automatically sent to Telegram + Google/Bing/Yahoo are notified daily at 2 PM BDT
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
 
      {/* Google Search Console */}
      <AdminCard
        title="🔍 Google Search Console"
        description="Connect your personal Google account to submit sitemaps and index stories"
      >
        <div className="space-y-4">
          {googleConnected ? (
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded bg-blue-500/20 px-3 py-1.5 text-sm text-blue-400">
                ✅ Connected with Google
              </span>
              <button
                type="button"
                onClick={disconnectGoogle}
                className="text-sm text-white/50 underline hover:text-white"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/60">
                Authorized access allows the site to directly notify Google whenever you publish new content.
              </p>
              <button
                type="button"
                onClick={connectGoogle}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  />
                </svg>
                Connect with Google
              </button>
              <p className="text-[10px] text-white/40">
                Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.
              </p>
            </div>
          )}
        </div>
      </AdminCard>

      {/* Quick Actions */}
      <AdminCard title="⚡ Quick Actions">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={submitToSearchEngines}
            disabled={submitting}
            className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "🚀 Submit Sitemap (Google + Bing + Yahoo)"}
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
