"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLoadingScreen from "./AdminLoadingScreen";
import AdminShell from "./AdminShell";

const MIN_DISPLAY_MS = 1200;

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const t = setTimeout(() => router.replace("/admin/login/"), MIN_DISPLAY_MS);
      return () => clearTimeout(t);
    }
    if (!isAdmin) {
      const t = setTimeout(() => router.replace("/admin/login/?denied=1"), MIN_DISPLAY_MS);
      return () => clearTimeout(t);
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <AdminLoadingScreen
        message="Checking admin access..."
        showLoginLink
      />
    );
  }

  if (!user || !isAdmin) {
    return (
      <AdminLoadingScreen
        message="Redirecting to admin login..."
        showLoginLink
      />
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
