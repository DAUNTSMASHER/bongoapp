"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
import { CATEGORIES } from "@/lib/stories";
import { adminFetch } from "@/lib/adminApi";

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

  const [categorySlug, setCategorySlug] = useState(
    CATEGORIES[0]?.slug ?? ""
  );
  const [storyId, setStoryId] = useState(urlStoryId);
  const [storyList, setStoryList] = useState<StoryOption[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
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

  // Load story when storyId changes (from dropdown or URL)
  const loadStoryById = (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    adminFetch("/api/admin/get-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id.trim() }),
    })
      .then(({ ok, data, error }) => {
        if (!ok) throw new Error(error || (data?.error as string) || "Failed to load");
        const storyData = data?.story as StoryData | undefined;
        if (storyData) {
          setStory(storyData);
          setForm(storyData);
          setCategorySlug(storyData.categorySlug || "");
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"))
      .finally(() => setLoading(false));
  };

  // Load story directly when storyId is in URL
  useEffect(() => {
    if (!urlStoryId.trim()) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminFetch("/api/admin/get-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: urlStoryId.trim() }),
    })
      .then(({ ok, data, error }) => {
        if (cancelled) return;
        if (!ok) throw new Error(error || (data?.error as string) || "Failed to load");
        const storyData = data?.story as StoryData | undefined;
        if (storyData) {
          setStory(storyData);
          setForm(storyData);
          setCategorySlug(storyData.categorySlug || "");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [urlStoryId]);

  // Load stories when category changes
  useEffect(() => {
    if (!categorySlug || urlStoryId) return;
    setLoadingList(true);
    setListError(null);
    setStoryId("");
    adminFetch(
      `/api/admin/list-stories?categorySlug=${encodeURIComponent(categorySlug)}`
    )
      .then(({ ok, data, error }) => {
        if (ok && Array.isArray(data?.stories)) {
          setStoryList(data.stories);
          setListError(null);
        } else {
          setStoryList([]);
          setListError(error || "Failed to load stories. Check FIREBASE_SERVICE_ACCOUNT in Vercel.");
        }
      })
      .catch(() => {
        setStoryList([]);
        setListError("Failed to load stories.");
      })
      .finally(() => setLoadingList(false));
  }, [categorySlug, urlStoryId]);

  async function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!storyId.trim()) return;
    setLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/get-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: storyId.trim() }),
      });
      if (!ok) throw new Error(error || (data?.error as string) || "Failed to load");
      const storyData = data?.story as StoryData | undefined;
      if (storyData) {
        setStory(storyData);
        setForm(storyData);
      }
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
      const { ok, data, error } = await adminFetch("/api/admin/update-story", {
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
          status: form.status,
        }),
      });
      if (!ok) throw new Error(error || (data?.error as string) || "Update failed");
      setStory(form);
      setSuccess("Story updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ContentWrapper className={`min-h-screen py-8 ${form ? "pb-28" : ""}`}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/admin/dashboard/" className="text-white/70 hover:text-white">
          ← Dashboard
        </Link>
        {form && <span className="text-xs text-white/50">{form.id}</span>}
      </div>
      
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Story</h1>

      {!form ? (
        <>
          {urlStoryId && loading ? (
            <p className="text-white/70">Loading story…</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-white/60">
                Select a category, then choose a story to edit.
              </p>
              <div className="max-w-xl space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/80">Category</label>
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    >
                      <option value="">— Select category —</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/80">Story</label>
                    <select
                      value={storyId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setStoryId(id);
                        if (id) loadStoryById(id);
                      }}
                      disabled={!categorySlug || loadingList}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
                    >
                      <option value="">— Select story —</option>
                      {storyList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {(s.headline || s.title || "Untitled").slice(0, 60)}
                          {(s.headline || s.title || "").length > 60 ? "…" : ""}
                        </option>
                      ))}
                    </select>
                    {loadingList && <p className="mt-1 text-xs text-white/50">Loading…</p>}
                    {listError && !loadingList && <p className="mt-1 text-xs text-red-400">{listError}</p>}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-[#0a0a0a] px-3 text-white/50">or</span>
                  </div>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (storyId.trim()) loadStoryById(storyId);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={storyId}
                    onChange={(e) => setStoryId(e.target.value)}
                    placeholder="Paste story ID (e.g. from Management)"
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <button
                    type="submit"
                    disabled={loading || !storyId.trim()}
                    className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                  >
                    {loading ? "Loading…" : "Load"}
                  </button>
                </form>
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            </>
          )}
        </>
      ) : (
        <form id="edit-story-form" onSubmit={handleSave} className="space-y-6">
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
            type="text"
            value={form.coverImageUrl ?? ""}
            onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
            placeholder="https://... or /story_cover/xxx.png"
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
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Status</label>
          <select
            value={form.status || "draft"}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="draft">Draft (hidden from site)</option>
            <option value="published">Published (visible on site)</option>
          </select>
          <p className="mt-1 text-xs text-white/50">
            {form.status === "published" ? "Story is visible on the site." : "Change to Published to show on the site."}
          </p>
        </div>
      </form>
      )}

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0a0a0a]/95 py-4 backdrop-blur-md md:left-64">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            {error && <span className="text-sm text-red-400">{error}</span>}
            {success && <span className="text-sm text-green-400">{success}</span>}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              form="edit-story-form"
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
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
        </div>
      </div>
    </ContentWrapper>
  );
}
