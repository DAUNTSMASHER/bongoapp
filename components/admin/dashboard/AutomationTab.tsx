"use client";

import { StoriesTab } from "./StoriesTab";
import { VideosTab } from "./VideosTab";

export function AutomationTab() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 text-xl font-bold text-white">Story Automation & Crawling</h2>
        <StoriesTab />
      </div>
      <div className="border-t border-white/10 pt-8">
        <h2 className="mb-4 text-xl font-bold text-white">Video Automation & Crawling</h2>
        <VideosTab />
      </div>
    </div>
  );
}
