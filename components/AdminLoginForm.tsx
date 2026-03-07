"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/hooks/useAdminAuth";
import { INITIAL_ADMIN_EMAIL } from "@/lib/adminAuth";

interface AdminLoginFormProps {
  denied?: boolean;
}

export default function AdminLoginForm({ denied }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/admin/dashboard/");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Sign in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#181818] p-6 shadow-xl">
      <h1 className="mb-2 text-xl font-bold text-white">Admin Sign In</h1>
      <p className="mb-4 text-sm text-white/60">
        Sign in with an admin account. Initial admin: {INITIAL_ADMIN_EMAIL}
      </p>
      <p className="mb-6 text-xs text-white/50">
        Same account works on multiple devices (phone, PC, tablet).
      </p>
      {denied && (
        <div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-amber-400 text-sm">
          Access denied. Only admins can view this page.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={INITIAL_ADMIN_EMAIL}
            required
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-white/80">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--primary)] py-3 font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
