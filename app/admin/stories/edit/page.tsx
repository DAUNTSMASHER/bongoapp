"use client";

import { useState } from "react";
import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";

interface StoryData {
  id: string;
  title: string;
  slug: string;
  body: string;
  summary: string;
  headline: string;
  categorySlug: string;
  tags: string[];
  status: string;
}

export default function EditStoryPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [story, setStory] = useState<StoryData | null>(null);
  const [form, setForm] = useState<StoryData | null>(null);

  async function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!id.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/get-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setStory(data.story);
      setForm(data.story);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
      setStory(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          headline: form.headline,
          body: form.body,
          summary: form.summary,
          slug: form.slug,
          categorySlug: form.categorySlug,
          tags: form.tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setStory(form);
      setSuccess("Story updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <ContentWrapper className="min-h-screen py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin/dashboard/" className="text-white/70 hover:text-white">
            ← Dashboard
          </Link>
        </div>
        <h1 className="mb-6 text-2xl font-bold text-white">Edit Story</h1>
        <p className="mb-4 text-sm text-white/60">
          Enter the story ID (Firestore document ID) to load and edit.
        </p>
        <form onSubmit={handleLoad} className="max-w-xl space-y-4">
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Story ID"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Story"}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="min-h-screen py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard/" className="text-white/70 hover:text-white">
          ← Dashboard
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Story</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">ID</label>
          <input
            type="text"
            value={form.id}
            readOnly
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white/60"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Title (name)</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Headline</label>
          <input
            type="text"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Body content</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={20}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Summary</label>
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Category slug</label>
          <input
            type="text"
            value={form.categorySlug}
            onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStory(null);
              setForm(null);
              setId("");
              setError(null);
              setSuccess(null);
            }}
            className="rounded-lg border border-white/20 px-6 py-3 text-white/80 hover:bg-white/10"
          >
            Load another
          </button>
        </div>
      </form>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
    </ContentWrapper>
  );
}
