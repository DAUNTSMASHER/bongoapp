"use client";

import Link from "next/link";
import { AdminCard } from "../AdminCard";

const LINKS = [
  { href: "/admin/stories/edit/", label: "Edit Stories", desc: "Name, headline, body, cover, status" },
  { href: "/admin/stories/add/", label: "Add Story", desc: "Create new story with cover" },
  { href: "/admin/videos/edit/", label: "Edit Videos", desc: "Name, URLs, thumbnail" },
  { href: "/admin/videos/add/", label: "Add Video", desc: "Create new video" },
  { href: "/admin/hot-chobi/", label: "Hot Chobi", desc: "Upload, edit gallery images" },
];

export function EditContentLinks() {
  return (
    <AdminCard title="Edit Content" description="Quick links to manage stories, videos, and images.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-white/90 transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <span className="font-medium">{item.label}</span>
            <span className="mt-0.5 text-xs text-white/50">{item.desc}</span>
          </Link>
        ))}
      </div>
    </AdminCard>
  );
}
