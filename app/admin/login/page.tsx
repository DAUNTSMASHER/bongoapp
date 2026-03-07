"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminLoadingScreen from "@/components/AdminLoadingScreen";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const MIN_DISPLAY_MS = 1200;

function AdminLoginContent() {
  const { user, isAdmin, loading } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const denied = searchParams.get("denied") === "1";

  useEffect(() => {
    if (loading) return;
    if (user && isAdmin) {
      const t = setTimeout(() => router.replace("/admin/dashboard/"), MIN_DISPLAY_MS);
      return () => clearTimeout(t);
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return <AdminLoadingScreen message="Loading..." showLoginLink />;
  }

  if (user && isAdmin) {
    return (
      <AdminLoadingScreen message="Signed in. Opening dashboard..." />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141414] px-4">
      <AdminLoginForm denied={denied} />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoadingScreen message="Loading..." />}>
      <AdminLoginContent />
    </Suspense>
  );
}
