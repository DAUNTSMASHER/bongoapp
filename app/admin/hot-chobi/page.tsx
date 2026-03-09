"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";

interface HotChobiItem {
  src: string;
  headline: string;
}

export default function HotChobiAdminPage() {
  const [items, setItems] = useState<HotChobiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/hot-chobi")
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  function addItem() {
    setItems((prev) => [...prev, { src: "/hot-chobi/new.webp", headline: "নতুন" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: "src" | "headline", value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hot-chobi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSuccess(`Saved ${items.length} items. Changes visible on homepage.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ContentWrapper className="min-h-screen py-8">
        <p className="text-white/70">Loading Hot Chobi…</p>
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
      <h1 className="mb-2 text-2xl font-bold text-white">Hot Chobi — Edit</h1>
      <p className="mb-6 text-sm text-white/60">
        Add, edit or remove Hot Chobi images. Image URL can be relative (e.g. /hot-chobi/01.webp) or full URL (Firebase Storage, etc.). Works on any device.
      </p>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-start"
            >
              <div className="shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-white/10 bg-black">
                  <img
                    src={item.src.startsWith("http") || item.src.startsWith("/") ? item.src : `/${item.src.replace(/^\//, "")}`}
                    alt={item.headline}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect fill='%23333' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' fill='%23666' text-anchor='middle' dy='.3em' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <label className="mb-1 block text-xs text-white/60">Image URL</label>
                  <input
                    type="text"
                    value={item.src}
                    onChange={(e) => updateItem(i, "src", e.target.value)}
                    placeholder="/hot-chobi/01.webp or https://..."
                    className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/60">Headline (Bengali)</label>
                  <input
                    type="text"
                    value={item.headline}
                    onChange={(e) => updateItem(i, "headline", e.target.value)}
                    placeholder="তৃষ্ণা"
                    className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="shrink-0 rounded border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            + Add item
          </button>
          <button
            type="submit"
            disabled={saving || items.length === 0}
            className="rounded-lg bg-[var(--primary)] px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
      <p className="mt-6 text-xs text-white/50">
        Tip: Upload images to Firebase Storage or place in /public/hot-chobi/ and use paths like /hot-chobi/filename.webp
      </p>
    </ContentWrapper>
  );
}
