"use client";

import { useState, useEffect } from "react";
import { AdminDropZone } from "@/components/admin/AdminDropZone";
import { uploadFile } from "@/lib/uploadToStorage";

interface HotChobiItem {
  src: string;
  headline: string;
}

export function AddImageTab() {
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
    setItems((prev) => [{ src: "", headline: "নতুন ছবি" }, ...prev]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: "src" | "headline", value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hot-chobi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.filter(i => i.src.trim() !== "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSuccess(`Saved gallery. Changes are now visible on the homepage!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8">
        <p className="text-white/70">Loading Gallery Images…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Hot Chobi Gallery</h2>
          <p className="mt-1 text-sm text-white/60">Upload and manage images for the homepage picture gallery.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            + Add New Image
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[var(--primary)] px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Gallery"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <ImageEditorCard 
             key={i} 
             item={item} 
             onUpdate={(field, val) => updateItem(i, field, val)} 
             onRemove={() => removeItem(i)} 
          />
        ))}
      </div>
    </div>
  );
}

function ImageEditorCard({ item, onUpdate, onRemove }: { item: HotChobiItem, onUpdate: (field: "src" | "headline", val: string) => void, onRemove: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-story-cover", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data?.url === "string") {
        onUpdate("src", data.url);
        setFile(null);
        return;
      }
      if (res.status === 503 || res.status === 500) {
        const url = await uploadFile(file, "hot_chobi");
        onUpdate("src", url);
        setFile(null);
        return;
      }
      alert(typeof data?.error === "string" ? data.error : "Upload failed");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex-1">
          <AdminDropZone
            value={item.src}
            onFileSelect={setFile}
            onUrlChange={(val) => onUpdate("src", val)}
            onUpload={handleUpload}
            uploading={uploading}
            selectedFile={file}
            aspectRatio="square"
            label="Image"
            placeholder="Upload from PC or paste URL"
            disabled={uploading}
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/60">Headline</label>
            <input
              type="text"
              value={item.headline}
              onChange={(e) => onUpdate("headline", e.target.value)}
              placeholder="e.g. তৃষ্ণা"
              className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="w-full rounded border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
          >
            Remove Image
          </button>
        </div>
      </div>
  );
}
