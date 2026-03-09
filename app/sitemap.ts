import type { MetadataRoute } from "next";
import { getPublishedStories } from "@/lib/storyData";
import { CATEGORIES } from "@/lib/stories";
import { getArchiveMonths } from "@/lib/stories";

/** Canonical production URL for sitemap/SEO. Never use VERCEL_URL - Google requires URLs to match your Search Console property (e.g. bongochoti.online). */
const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

/** Convert cover path to absolute URL for sitemap images */
function toAbsoluteImageUrl(base: string, path?: string): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${base}/stories/`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.95 },
    { url: `${base}/videos/`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.95 },
    { url: `${base}/about/`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/categories/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/archive/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${base}/search/`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/library/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/categories/${c.slug}/`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const archiveMonths = getArchiveMonths(2026, 3, 2024, 3);
  const archivePages: MetadataRoute.Sitemap = archiveMonths.map((m) => ({
    url: `${base}/archive/${m.slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  let storyPages: MetadataRoute.Sitemap = [];
  try {
    const stories = await getPublishedStories({ limit: 10000, forSitemap: true });
    storyPages = stories.map((s) => {
      const coverUrl = toAbsoluteImageUrl(base, s.coverImageUrl);
      const entry: MetadataRoute.Sitemap[number] = {
        url: `${base}/stories/${s.id}/`,
        lastModified: s.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
      if (coverUrl) {
        (entry as { images?: string[] }).images = [coverUrl];
      }
      return entry;
    });
  } catch {
    // Firebase may not be configured during build
  }

  return [...staticPages, ...categoryPages, ...archivePages, ...storyPages];
}
