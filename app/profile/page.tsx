"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import { useAuth, signInWithGoogle, signInAnonymouslyUser, signOut } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, isAnonymous, isGoogleUser, isAdmin, canUseArchive, loading } = useAuth();
  const [logoGenerating, setLogoGenerating] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);

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

  async function handleGoogleSignIn() {
    setSignInError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setSignInError(e instanceof Error ? e.message : "Sign in failed");
    }
  }

  async function handleAnonymousSignIn() {
    setSignInError(null);
    try {
      await signInAnonymouslyUser();
    } catch (e) {
      setSignInError(e instanceof Error ? e.message : "Sign in failed");
    }
  }

  if (loading) {
    return (
      <ContentWrapper className="flex min-h-screen items-center justify-center py-8">
        <p className="text-white/60">Loading...</p>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/" label="হোম" />
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">
        Profile & Settings
      </h1>

      {/* Account section */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
          Account
        </h2>
        {!user ? (
          <>
            <p className="text-white/70">
              Sign in with Google to access Archive. Continue as Guest to browse without Archive.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-100 active:scale-95"
              >
                Sign in with Google
              </button>
              <button
                type="button"
                onClick={handleAnonymousSignIn}
                className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                Continue as Guest
              </button>
            </div>
            <Link
              href="/admin/login/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-white/60 hover:text-white"
            >
              Admin? Sign in with email
            </Link>
          </>
        ) : (
          <>
            <p className="text-white/70">
              {isAnonymous
                ? "Signed in as Guest. Sign in with Google to access Archive."
                : isAdmin
                  ? "Signed in as Admin. Full access."
                  : "Signed in with Google. You can use Archive."}
            </p>
            {canUseArchive && (
              <Link
                href="/archive/"
                className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Go to Archive
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="ml-3 mt-3 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Sign Out
            </button>
          </>
        )}
        {signInError && <p className="mt-2 text-sm text-red-400">{signInError}</p>}
      </section>

      {/* Admin: Full profile features */}
      {isAdmin && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
              Admin
            </h2>
            <Link
              href="/admin/"
              className="inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-primary-hover"
            >
              Admin Dashboard
            </Link>
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
            {/* Netflix theme locked – ThemeSwitcher removed */}
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
              AI Logo
            </h2>
            <p className="mb-3 text-sm text-white/70">
              Generate an AI logo with a free Hugging Face API key.
            </p>
            <div className="flex items-center gap-3">
              <Logo size={40} showText={false} />
              <button
                type="button"
                onClick={handleGenerateLogo}
                disabled={logoGenerating}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-60"
              >
                {logoGenerating ? "Generating…" : "Generate AI logo"}
              </button>
            </div>
            {logoError && <p className="mt-2 text-sm text-red-400">{logoError}</p>}
          </section>
        </>
      )}

      {/* Google user (non-admin): Archive only, no other profile features */}
      {isGoogleUser && !isAdmin && (
        <p className="text-white/50">
          You have access to Archive. Other profile features are for admins.
        </p>
      )}

      {/* Anonymous: prompt to upgrade for archive */}
      {isAnonymous && (
        <p className="text-white/50">
          Sign in with Google to access the Archive feature.
        </p>
      )}
    </ContentWrapper>
  );
}
