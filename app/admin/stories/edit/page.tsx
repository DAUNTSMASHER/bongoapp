"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
import { CATEGORIES } from "@/lib/stories";

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
  characterNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  coverImageUrl?: string;
}

interface StoryOption {
  id: string;
  title: string;
  headline: string;
}

export default function EditStoryPage() {
  const searchParams = useSearchParams();
  const urlStoryId = searchParams.get("storyId") || "";

  const [categorySlug, setCategorySlug] = useState("");
  const [storyId, setStoryId] = useState(urlStoryId);
  const [storyList, setStoryList] = useState<StoryOption[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [story, setStory] = useState<StoryData | null>(null);
  const [form, setForm] = useState<StoryData | null>(null);
  const [renameOld, setRenameOld] = useState("");
  const [renameNew, setRenameNew] = useState("");

  // Sync storyId from URL
  useEffect(() => {
    if (urlStoryId) setStoryId(urlStoryId);
  }, [urlStoryId]);

  // Load story directly when storyId is in URL
  useEffect(() => {
    if (!urlStoryId.trim()) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/admin/get-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: urlStoryId.trim() }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) throw new Error(data?.error || "Failed to load");
        setStory(data.story);
        setForm(data.story);
        setCategorySlug(data.story?.categorySlug || "");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [urlStoryId]);

  // Load stories when category changes
  useEffect(() => {
    if (!categorySlug || urlStoryId) return;
    setLoadingList(true);
    setStoryId("");
    fetch(`/api/admin/list-stories?categorySlug=${encodeURIComponent(categorySlug)}`)
      .then((res) => res.json())
      .then((data) => {
        setStoryList(data.stories || []);
      })
      .catch(() => setStoryList([]))
      .finally(() => setLoadingList(false));
  }, [categorySlug, urlStoryId]);

  async function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!storyId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/get-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: storyId.trim() }),
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
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
          characterNames: form.characterNames,
          coverImageUrl: form.coverImageUrl,
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
        {urlStoryId && loading ? (
          <p className="text-white/70">Loading story…</p>
        ) : (
        <>
        <p className="mb-4 text-sm text-white/60">
          Select a category, then choose a story to edit.
        </p>
        <form onSubmit={handleLoad} className="max-w-xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">Category</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="">— Select category —</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">Story</label>
            <select
              value={storyId}
              onChange={(e) => setStoryId(e.target.value)}
              disabled={!categorySlug || loadingList}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
            >
              <option value="">— Select story —</option>
              {storyList.map((s) => (
                <option key={s.id} value={s.id}>
                  {(s.headline || s.title || "Untitled").slice(0, 80)}
                  {(s.headline || s.title || "").length > 80 ? "…" : ""}
                </option>
              ))}
            </select>
            {loadingList && <p className="mt-1 text-xs text-white/50">Loading stories…</p>}
          </div>
          <button
            type="submit"
            disabled={loading || !storyId}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Story"}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </>
        )}
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
          <label className="mb-1 block text-sm font-medium text-white/80">Cover image URL</label>
          <input
            type="url"
            value={form.coverImageUrl ?? ""}
            onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
            placeholder="https://... or /hot-chobi/..."
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <p className="mt-1 text-xs text-white/50">Paste Firebase Storage URL or relative path. Leave empty for no cover.</p>
          {form.coverImageUrl && (
            <div className="mt-2 relative aspect-video max-w-xs overflow-hidden rounded-lg border border-white/10">
              <img src={form.coverImageUrl} alt="Cover preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
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

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-medium text-white/90">Rename character (replace all in story)</h3>
          <p className="mb-3 text-xs text-white/60">
            Replace every occurrence of a character name (e.g. আসলাম) with a new name (e.g. রাকিব). Updates body, summary, headline.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-white/60">Replace</label>
              <input
                type="text"
                value={renameOld}
                onChange={(e) => setRenameOld(e.target.value)}
                placeholder="আসলাম"
                list="char-names"
                className="w-40 rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40"
              />
              <datalist id="char-names">
                {(form.characterNames || []).map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">With</label>
              <input
                type="text"
                value={renameNew}
                onChange={(e) => setRenameNew(e.target.value)}
                placeholder="রাকিব"
                className="w-40 rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const old = renameOld.trim();
                const newName = renameNew.trim();
                if (!old || !newName) return;
                const rep = (s: string) => (s ? s.split(old).join(newName) : s);
                const updatedCharacterNames = (form.characterNames || []).map((n) => (n === old ? newName : n));
                setForm({
                  ...form,
                  body: rep(form.body),
                  summary: rep(form.summary),
                  headline: rep(form.headline),
                  characterNames: updatedCharacterNames,
                });
                setRenameOld("");
                setRenameNew("");
                setSuccess(`Replaced all "${old}" with "${newName}". Save to persist.`);
              }}
              disabled={!renameOld.trim() || !renameNew.trim()}
              className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
            >
              Apply rename
            </button>
          </div>
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
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-white/90">SEO (search engine)</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-white/60">SEO Title (meta)</label>
              <input
                type="text"
                value={form.seoTitle ?? ""}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                placeholder={form.headline || form.title}
                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">SEO Description (meta)</label>
              <textarea
                value={form.seoDescription ?? ""}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                placeholder={form.summary?.slice(0, 155)}
                rows={2}
                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40"
              />
              <p className="mt-1 text-xs text-white/50">150–160 chars ideal for search snippets</p>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Category</label>
          <select
            value={form.categorySlug}
            onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            {!CATEGORIES.some((c) => c.slug === form.categorySlug) && form.categorySlug && (
              <option value={form.categorySlug}>{form.categorySlug}</option>
            )}
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
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
              setStoryId("");
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
