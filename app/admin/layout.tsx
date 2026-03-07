"use client";

import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import AdminErrorBoundary from "@/components/AdminErrorBoundary";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isLogin = pathname.startsWith("/admin/login");
  const isDashboard = pathname.startsWith("/admin/dashboard");

  // Login: no guard, standalone page
  if (isLogin) {
    return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
  }

  // Dashboard: protected by guard
  if (isDashboard) {
    return (
      <AdminErrorBoundary>
        <AdminGuard>{children}</AdminGuard>
      </AdminErrorBoundary>
    );
  }

  // /admin: redirect page, no guard
  return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
}
