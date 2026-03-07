"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLoadingScreen from "@/components/AdminLoadingScreen";

const MIN_DISPLAY_MS = 1200;

/**
 * Admin entry: redirects to login or dashboard based on auth.
 * Uses router.replace (client-side) to keep auth state in memory and avoid redirect loop.
 */
export default function AdminRedirectPage() {
  const { user, isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const go = () => {
      if (!user) router.replace("/admin/login/");
      else if (!isAdmin) router.replace("/admin/login/?denied=1");
      else router.replace("/admin/dashboard/");
    };
    const t = setTimeout(go, MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, [user, isAdmin, loading, router]);

  const msg = loading
    ? "Loading..."
    : !user
      ? "Redirecting to login..."
      : !isAdmin
        ? "Redirecting to login..."
        : "Redirecting to dashboard...";

  return <AdminLoadingScreen message={msg} showLoginLink />;
}
