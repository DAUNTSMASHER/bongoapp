"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { UploadIcon, ImageIcon } from "@/components/icons";

interface AdminDropZoneProps {
  value: string;
  onFileSelect: (file: File | null) => void;
  onUrlChange?: (url: string) => void;
  onUpload: () => void;
  uploading: boolean;
  selectedFile: File | null;
  aspectRatio?: "video" | "square" | "story";
  label?: string;
  accept?: string;
  placeholder?: string;
  disabled?: boolean;
}

const ASPECT = {
  video: "aspect-video",
  square: "aspect-square",
  story: "aspect-[3/4]",
} as const;

export function AdminDropZone({
  value,
  onFileSelect,
  onUrlChange,
  onUpload,
  uploading,
  selectedFile,
  aspectRatio = "video",
  label = "Upload image",
  accept = "image/*",
  placeholder = "Drag & drop or click to upload",
  disabled = false,
}: AdminDropZoneProps) {
  const [drag, setDrag] = useState(false);

  const isValidFile = (f: File) =>
    f.type.startsWith("image/") || (accept.includes("video") && f.type.startsWith("video/"));

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      if (disabled || uploading) return;
      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) onFileSelect(file);
    },
    [disabled, uploading, onFileSelect, accept]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const handleDragLeave = useCallback(() => setDrag(false), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) onFileSelect(file);
    e.target.value = "";
  };

  const hasPreview = value || selectedFile;
  const previewUrl = value || (selectedFile ? URL.createObjectURL(selectedFile) : "");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
          drag ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-white/20 bg-white/[0.02] hover:border-white/30"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={disabled || uploading}
        />
        {hasPreview ? (
          <div className={`relative ${ASPECT[aspectRatio]} max-h-64 w-full`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity hover:opacity-100">
              {selectedFile && !value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onUpload();
                  }}
                  disabled={uploading}
                  className="rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white transition-opacity hover:bg-[var(--primary-hover)] disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Upload image"}
                </button>
              )}
              {value && (
                <p className="text-sm text-white/90">Image ready</p>
              )}
              <p className="mt-2 text-xs text-white/60">Drop new image to replace</p>
            </div>
          </div>
        ) : (
          <div className={`flex ${ASPECT[aspectRatio]} max-h-48 flex-col items-center justify-center gap-3 p-6`}>
            <div className="rounded-full bg-white/10 p-4">
              <ImageIcon size={28} className="text-white/60" />
            </div>
            <p className="text-center text-sm text-white/70">{placeholder}</p>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <UploadIcon size={14} />
              <span>{accept.includes("video") ? "MP4, WebM up to 100MB" : "JPG, PNG, WebP up to 5MB"}</span>
            </div>
          </div>
        )}
      </div>
      {onUrlChange && (
        <>
          <p className="mt-2 text-xs text-white/50">Or paste image URL</p>
          <input
            type="text"
            value={value}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://... or /story_cover/xxx.png"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none"
            disabled={disabled}
          />
        </>
      )}
      {selectedFile && !value && (
        <p className="mt-2 text-xs text-amber-400">
          Selected: {selectedFile.name}. Click &quot;Upload image&quot; above or drop a new file.{" "}
          <button type="button" onClick={() => onFileSelect(null)} className="underline hover:no-underline">
            Clear file
          </button>
        </p>
      )}
    </div>
  );
}
