import type { MetadataRoute } from "next";
import { getPublishedStories } from "@/lib/storyData";
import { CATEGORIES } from "@/lib/stories";
import { getArchiveMonths } from "@/lib/stories";
import { getAllBlogSlugs } from "@/lib/blogPosts";

export const dynamic = "force-static";

/** Canonical production URL - must be the one that serves 200 (no redirect). Use your Search Console property URL. */
const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

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
    { url: `${base}/privacy/`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/categories/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/archive/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${base}/search/`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/library/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${base}/blog/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/categories/${c.slug}/`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
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
    const { db } = await import("@/lib/firebase");
    const { collection, getDocs, query, where, limit } = await import("firebase/firestore");
    const q = query(
      collection(db, "stories"),
      where("status", "==", "published"),
      limit(10000)
    );
    const snapshot = await getDocs(q);
    storyPages = snapshot.docs.map((doc) => {
      const data = doc.data();
      const coverUrl = toAbsoluteImageUrl(base, data.coverImageUrl);
      const entry: MetadataRoute.Sitemap[number] = {
        url: `${base}/stories/${doc.id}/`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
      if (coverUrl) {
        (entry as { images?: string[] }).images = [coverUrl];
      }
      return entry;
    });
  } catch (error) {
    console.error("Failed to generate sitemap for stories:", error);
  }

  return [...staticPages, ...categoryPages, ...blogPages, ...archivePages, ...storyPages];
}
