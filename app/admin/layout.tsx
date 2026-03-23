"use client";

import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import AdminErrorBoundary from "@/components/AdminErrorBoundary";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isLogin = pathname.startsWith("/admin/login");
  const isProtected =
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/admin/stats") ||
    pathname.startsWith("/admin/stories") ||
    pathname.startsWith("/admin/videos") ||
    pathname.startsWith("/admin/hot-chobi") ||
    pathname.startsWith("/admin/marketing");

  // Login: no guard, standalone page
  if (isLogin) {
    return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
  }

  // Dashboard, Edit Stories, Edit Videos: protected by guard
  if (isProtected) {
    return (
      <AdminErrorBoundary>
        <AdminGuard>{children}</AdminGuard>
      </AdminErrorBoundary>
    );
  }

  // /admin: redirect page, no guard
  return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
}
