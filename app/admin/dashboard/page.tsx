"use client";

import { useState } from "react";
import ContentWrapper from "@/components/ContentWrapper";
import { CATEGORIES } from "@/lib/stories";
import { useAdminAuth, signOut, addAdminEmail } from "@/hooks/useAdminAuth";
import { INITIAL_ADMIN_EMAIL } from "@/lib/adminAuth";

interface VideoCrawlResult {
  extracted: number;
  inserted: number;
  skipped: number;
  message: string;
}

interface StoryCrawlResult {
  extracted: number;
  inserted: number;
  message: string;
}

interface PublishResult {
  published: number;
  message: string;
}

export default function AdminDashboardPage() {
  const { user, adminEmails, refreshAdmins } = useAdminAuth();
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminResult, setAddAdminResult] = useState<string | null>(null);
  const [addAdminError, setAddAdminError] = useState<string | null>(null);

  const [url, setUrl] = useState("https://www.banglachotikahinii.com/videos/");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoCrawlResult | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [storyUrl, setStoryUrl] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [count, setCount] = useState(40);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyResult, setStoryResult] = useState<StoryCrawlResult | null>(null);
  const [storyError, setStoryError] = useState<string | null>(null);

  const [publishLoading, setPublishLoading] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  async function handleVideoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVideoError(null);
    setVideoResult(null);
    if (!url.trim()) return;
    setVideoLoading(true);
    try {
      const res = await fetch("/api/admin/crawl-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), maxVideos: 15 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setVideoResult(data);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setVideoLoading(false);
    }
  }

  async function handleStorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setStoryError(null);
    setStoryResult(null);
    if (!storyUrl.trim() || !categorySlug) return;
    setStoryLoading(true);
    try {
      const res = await fetch("/api/admin/crawl-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: storyUrl.trim(),
          categorySlug,
          count: Math.min(Math.max(count, 1), 100),
        }),
      });
      const text = await res.text();
      let data: { error?: string; extracted?: number; inserted?: number; message?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "Server returned invalid response. Story crawl requires a server deployment. Use 'npm run crawl' locally or deploy with Firebase Functions."
        );
      }
      if (!res.ok) throw new Error(data.error || "Request failed");
      setStoryResult(data as StoryCrawlResult);
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStoryLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/admin/login/";
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAddAdminError(null);
    setAddAdminResult(null);
    if (!newAdminEmail.trim() || !user?.email) return;
    setAddAdminLoading(true);
    try {
      await addAdminEmail(newAdminEmail.trim());
      await refreshAdmins();
      setAddAdminResult(`Admin ${newAdminEmail} added. They can now sign in.`);
      setNewAdminEmail("");
    } catch (err) {
      setAddAdminError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setAddAdminLoading(false);
    }
  }

  async function handlePublish() {
    setPublishError(null);
    setPublishResult(null);
    setPublishLoading(true);
    try {
      const res = await fetch("/api/admin/publish-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlug: categorySlug ? categorySlug : undefined }),
      });
      const text = await res.text();
      let data: { error?: string; published?: number; message?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "Server returned invalid response. Publish requires a server deployment. Deploy with Firebase Functions to use this feature."
        );
      }
      if (!res.ok) throw new Error(data.error || "Request failed");
      setPublishResult(data as PublishResult);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishLoading(false);
    }
  }

  const allAdmins = [INITIAL_ADMIN_EMAIL, ...adminEmails];

  return (
    <ContentWrapper className="min-h-screen py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Admin — Generate & Add Content
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">{user?.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Add Admin */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Add Admin</h2>
        <p className="mb-3 text-sm text-white/60">
          Add another admin by email. They must have a Firebase Auth account with this email.
        </p>
        <form onSubmit={handleAddAdmin} className="max-w-xl space-y-3">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="newadmin@example.com"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            disabled={addAdminLoading}
          />
          <button
            type="submit"
            disabled={addAdminLoading}
            className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {addAdminLoading ? "Adding..." : "Add Admin"}
          </button>
        </form>
        {addAdminError && <p className="mt-2 text-sm text-red-400">{addAdminError}</p>}
        {addAdminResult && <p className="mt-2 text-sm text-green-400">{addAdminResult}</p>}
        <p className="mt-2 text-xs text-white/50">Current admins: {allAdmins.join(", ")}</p>
      </section>

      <hr className="my-10 border-white/10" />

      {/* Videos */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Videos</h2>
        <p className="mb-4 text-xs text-white/50">
          ভিডিও ফেচ ও সেভ করতে বাটনে ক্লিক করুন। এক ক্লিকেই অ্যাপে দেখাবে।
        </p>
        <form onSubmit={handleVideoSubmit} className="max-w-xl space-y-4">
          <div>
            <label htmlFor="url" className="mb-2 block text-sm font-medium text-white/80">
              Website URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/videos"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={videoLoading}
            />
          </div>
          <button
            type="submit"
            disabled={videoLoading}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {videoLoading ? "লোড হচ্ছে..." : "ভিডিও ফেচ ও সংরক্ষণ"}
          </button>
        </form>
        {videoError && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {videoError}
          </div>
        )}
        {videoResult && (
          <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-4 text-green-100">
            <p className="font-semibold text-green-300">Videos added successfully</p>
            <p className="mt-2">{videoResult.message}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span>Extracted: {videoResult.extracted}</span>
              <span>Added: {videoResult.inserted}</span>
              <span>Skipped: {videoResult.skipped}</span>
            </div>
          </div>
        )}
      </section>

      <hr className="my-10 border-white/10" />

      {/* Stories */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Stories (Bangla)</h2>
        <form onSubmit={handleStorySubmit} className="max-w-xl space-y-4">
          <div>
            <label htmlFor="storyUrl" className="mb-2 block text-sm font-medium text-white/80">
              Website URL (listing/category page)
            </label>
            <input
              id="storyUrl"
              type="url"
              value={storyUrl}
              onChange={(e) => setStoryUrl(e.target.value)}
              placeholder="https://example.com/stories"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={storyLoading}
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-white/80">
              Category
            </label>
            <select
              id="category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={storyLoading}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="count" className="mb-2 block text-sm font-medium text-white/80">
              Number to add (1–100)
            </label>
            <input
              id="count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 40)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={storyLoading}
            />
          </div>
          <button
            type="submit"
            disabled={storyLoading}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {storyLoading ? "Crawling..." : "Generate and Add Stories"}
          </button>
        </form>
        {storyError && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {storyError}
          </div>
        )}
        {storyResult && (
          <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-4 text-green-100">
            <p className="font-semibold text-green-300">Stories added as draft</p>
            <p className="mt-2">{storyResult.message}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span>Extracted: {storyResult.extracted}</span>
              <span>Saved: {storyResult.inserted}</span>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-white/80">Publish drafts</h3>
          <p className="mb-3 text-sm text-white/60">
            Publish all draft stories to make them live. Optionally filter by category.
          </p>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishLoading}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
          >
            {publishLoading ? "Publishing..." : "Publish"}
          </button>
        </div>
        {publishError && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {publishError}
          </div>
        )}
        {publishResult && (
          <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-4 text-green-100">
            <p className="font-semibold text-green-300">{publishResult.message}</p>
          </div>
        )}
      </section>
    </ContentWrapper>
  );
}
