"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
import {
  AddAdminSection,
  AddStoryTab,
  AddVideoTab,
  AddImageTab,
  ManagementTab,
  AutomationTab,
  MarketingTab,
} from "@/components/admin/dashboard";

type TabId = "add-story" | "add-video" | "add-image" | "management" | "marketing" | "automation";

const TABS: { id: TabId; label: string; shortLabel: string }[] = [
  { id: "add-story", label: "Add Story", shortLabel: "Story" },
  { id: "add-video", label: "Add Video", shortLabel: "Video" },
  { id: "add-image", label: "Add Image", shortLabel: "Image" },
  { id: "management", label: "Manage Content", shortLabel: "Manage" },
  { id: "marketing", label: "Marketing", shortLabel: "Marketing" },
  { id: "automation", label: "Automation", shortLabel: "Auto" },
];

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>("add-story");
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) setActiveTab(tabParam);
  }, [tabParam]);

  const tabContent = useMemo(() => {
    if (activeTab === "add-story") return <AddStoryTab />;
    if (activeTab === "add-video") return <AddVideoTab />;
    if (activeTab === "add-image") return <AddImageTab />;
    if (activeTab === "management") return <ManagementTab />;
    if (activeTab === "marketing") return <MarketingTab />;
    if (activeTab === "automation") return <AutomationTab />;
    return <AddStoryTab />;
  }, [activeTab]);

  return (
    <ContentWrapper className="min-h-screen py-6 px-4 md:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">
            {activeTab === "add-story" && "Manually write and upload a new story"}
            {activeTab === "add-video" && "Manually add a video link and thumbnail"}
            {activeTab === "add-image" && "Upload hot chobi gallery pictures"}
            {activeTab === "management" && "Edit or bulk delete content"}
            {activeTab === "marketing" && "Distribute stories & auto-post to social channels"}
            {activeTab === "automation" && "Scrape and crawl external websites"}
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
