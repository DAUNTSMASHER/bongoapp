"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAdminAuth, signOut } from "@/hooks/useAdminAuth";
import {
  LayoutDashboardIcon,
  BarChartIcon,
  FileTextIcon,
  PlayIcon,
  ImageIcon,
  BackIcon,
} from "@/components/icons";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard/", label: "Dashboard", Icon: LayoutDashboardIcon },
      { href: "/admin/stats/", label: "Statistics", Icon: BarChartIcon },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/stories/add/", label: "Add Story", Icon: FileTextIcon },
      { href: "/admin/stories/edit/", label: "Edit Stories", Icon: FileTextIcon },
      { href: "/admin/dashboard/?tab=management", label: "Story Management", Icon: FileTextIcon },
      { href: "/admin/videos/add/", label: "Add Video", Icon: PlayIcon },
      { href: "/admin/videos/edit/", label: "Edit Videos", Icon: PlayIcon },
      { href: "/admin/hot-chobi/", label: "Hot Chobi", Icon: ImageIcon },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string) {
    const path = href.replace(/\?.*$/, "").replace(/\/$/, "") || "/";
    if (href.includes("tab=management")) {
      return pathname.startsWith("/admin/dashboard") && searchParams.get("tab") === "management";
    }
    return pathname === href || pathname === path || (path !== "/admin/dashboard" && pathname.startsWith(path));
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] md:flex-row">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-white/5 bg-[#0d0d0d] shadow-xl transition-transform duration-300 ease-out md:static md:z-auto md:w-64 md:translate-x-0 md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <Link
            href="/admin/dashboard/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 transition-colors hover:opacity-90"
          >
            <span className="text-lg font-bold text-white">bongochoti</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70">
              admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                {group.label}
              </p>
              <div className="space-y-0.5 px-3">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.Icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} className="shrink-0 opacity-80" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/5 p-4">
          <p className="truncate px-3 text-xs text-white/50">{user?.email}</p>
          <Link
            href="/"
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <BackIcon size={16} />
            Back to site
          </Link>
          <button
            type="button"
            onClick={() => {
              signOut();
              window.location.href = "/admin/login/";
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="min-h-screen min-w-0 flex-1 overflow-auto bg-[#0a0a0a]">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-10 flex size-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg transition-transform hover:scale-105 md:hidden"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="min-h-screen pb-20 md:pb-0">{children}</div>
      </main>
    </div>
  );
}
