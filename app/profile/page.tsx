"use client";

import { useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Logo from "@/components/Logo";

export default function ProfilePage() {
  const [logoGenerating, setLogoGenerating] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  async function handleGenerateLogo() {
    setLogoGenerating(true);
    setLogoError(null);
    try {
      const res = await fetch("/api/generate-logo", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLogoGenerating(false);
    }
  }
  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-white">
        Profile & Settings
      </h1>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
          Account
        </h2>
        <p className="text-white/70">
          Sign in with Google or Email to sync bookmarks and reading history.
        </p>
        <button
          type="button"
          className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-[var(--primary-hover)] active:scale-95"
        >
          Sign in
        </button>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
          Preferences
        </h2>
        <ul className="mb-6 space-y-3">
          <li className="rounded-lg border border-white/10 bg-white/5 p-4 font-medium text-white">
            Language: Bangla
          </li>
        </ul>
        <ThemeSwitcher />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
          AI Logo
        </h2>
        <p className="mb-3 text-sm text-white/70">
          Generate an AI logo with a free Hugging Face API key. Add{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">HUGGINGFACE_API_KEY</code> to{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">.env.local</code>.
        </p>
        <div className="flex items-center gap-3">
          <Logo size={40} showText={false} />
          <button
            type="button"
            onClick={handleGenerateLogo}
            disabled={logoGenerating}
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            {logoGenerating ? "Generating…" : "Generate AI logo"}
          </button>
        </div>
        {logoError && (
          <p className="mt-2 text-sm text-red-400">{logoError}</p>
        )}
      </section>
    </div>
  );
}
