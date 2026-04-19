"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminErrorBoundary from "@/components/AdminErrorBoundary";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isLogin = pathname.startsWith("/admin/login");
  const isProtected = pathname.startsWith("/admin") && !isLogin;

  if (isLogin) {
    return (
      <AdminErrorBoundary>
        <Suspense fallback={<div className="p-8 text-charcoal">Loading...</div>}>
          {children}
        </Suspense>
      </AdminErrorBoundary>
    );
  }

  if (isProtected) {
    return (
      <AdminErrorBoundary>
        <AdminGuard>
          <Suspense fallback={<div className="p-8 text-charcoal">Syncing admin context...</div>}>
            {children}
          </Suspense>
        </AdminGuard>
      </AdminErrorBoundary>
    );
  }

  return (
    <AdminErrorBoundary>
      <Suspense fallback={<div className="p-8 text-charcoal">Loading...</div>}>
        {children}
      </Suspense>
    </AdminErrorBoundary>
  );
}
