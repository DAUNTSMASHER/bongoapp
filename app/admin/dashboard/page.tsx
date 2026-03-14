"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
import {
  AddAdminSection,
  VideosTab,
  StoriesTab,
  ManagementTab,
} from "@/components/admin/dashboard";

type TabId = "videos" | "stories" | "management";

const TABS: { id: TabId; label: string; shortLabel: string }[] = [
  { id: "stories", label: "Stories", shortLabel: "Stories" },
  { id: "videos", label: "Videos", shortLabel: "Videos" },
  { id: "management", label: "Management", shortLabel: "Manage" },
];

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>("stories");
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) setActiveTab(tabParam);
  }, [tabParam]);

  const tabContent = useMemo(() => {
    if (activeTab === "videos") return <VideosTab />;
    if (activeTab === "stories") return <StoriesTab />;
    return <ManagementTab />;
  }, [activeTab]);

  return (
    <ContentWrapper className="min-h-screen py-6 px-4 md:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">
            {activeTab === "stories" && "Crawl, publish, and manage stories"}
            {activeTab === "videos" && "Fetch and add videos"}
            {activeTab === "management" && "List, delete, or edit stories in bulk"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddAdmin(!showAddAdmin)}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
        >
          {showAddAdmin ? "Hide Add Admin" : "Add Admin"}
        </button>
      </div>

      {showAddAdmin && (
        <div className="mb-6">
          <AddAdminSection />
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabContent}
    </ContentWrapper>
  );
}
