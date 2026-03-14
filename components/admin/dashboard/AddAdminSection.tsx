"use client";

import { useState } from "react";
import { AdminCard } from "../AdminCard";
import { useAdminAuth, addAdminEmail } from "@/hooks/useAdminAuth";
import { INITIAL_ADMIN_EMAIL } from "@/lib/adminAuth";

export function AddAdminSection() {
  const { user, adminEmails, refreshAdmins } = useAdminAuth();
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAdmins = [INITIAL_ADMIN_EMAIL, ...adminEmails];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!newAdminEmail.trim() || !user?.email) return;
    setLoading(true);
    try {
      await addAdminEmail(newAdminEmail.trim());
      await refreshAdmins();
      setResult(`Admin ${newAdminEmail} added. They can now sign in.`);
      setNewAdminEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminCard
      title="Add Admin"
      description="Add another admin by email. They must have a Firebase Auth account with this email."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          placeholder="newadmin@example.com"
          className="w-full max-w-md rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--primary)] px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add Admin"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {result && <p className="mt-2 text-sm text-green-400">{result}</p>}
      <p className="mt-2 text-xs text-white/50">Current admins: {allAdmins.join(", ")}</p>
    </AdminCard>
  );
}
