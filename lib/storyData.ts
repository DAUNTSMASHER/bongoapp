/**
 * Server-side: fetch published stories from Firestore.
 * Used by RSC pages to show crawled stories on the site.
 * Applies name replacements from config/nameMappings to headline/title.
 * Cached with unstable_cache (revalidate 60s) to reduce Firestore reads.
 */

import { unstable_cache } from "next/cache";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import { applyNameReplacementsToStory, type NameMappings } from "@/lib/nameReplacement";
import type { Story } from "@/types/story";

function toStory(doc: { id: string; data: () => Record<string, unknown> }): Story {
  const d = doc.data();
  const createdAt = (d.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date();
  const updatedAt = (d.updatedAt as { toDate?: () => Date })?.toDate?.() ?? createdAt;
  const publishedAt = (d.publishedAt as { toDate?: () => Date })?.toDate?.();
  return {
    id: doc.id,
    title: (d.title as string) || "Untitled",
    slug: (d.slug as string) || doc.id,
    body: (d.body as string) || "",
    summary: d.summary as string | undefined,
    coverImageUrl: (d.coverImageUrl as string | undefined)?.replace(/\\/g, '/'),
    tags: (Array.isArray(d.tags) ? d.tags : []) as string[],
    categorySlug: d.categorySlug as string | undefined,
    language: (d.language as string) || "bn",
    lengthType: (d.lengthType as Story["lengthType"]) || "medium",
    sourceUrl: d.sourceUrl as string | undefined,
    status: (d.status as Story["status"]) || "published",
    popularityScore: (d.popularityScore as number) ?? 0,
    createdAt,
    updatedAt,
    publishedAt,
    headline: d.headline as string | undefined,
    seoTitle: d.seoTitle as string | undefined,
    seoDescription: d.seoDescription as string | undefined,
    hashtags: (Array.isArray(d.hashtags) ? d.hashtags : []) as string[],
    parts: (Array.isArray(d.parts) ? d.parts : []) as string[],
    characterNames: Array.isArray(d.characterNames) ? (d.characterNames as string[]) : undefined,
  };
}

async function getNameMappings(): Promise<NameMappings> {
  const firestore = initFirestore();
  const doc = await firestore.collection("config").doc("nameMappings").get();
  return (doc.exists && doc.data()?.mappings) || {};
}

const STORY_REVALIDATE = 60;

async function getPublishedStoriesUncached(options?: {
  categorySlug?: string;
  limit?: number;
  forSitemap?: boolean;
}): Promise<Story[]> {
  const maxLimit = options?.forSitemap ? 10000 : 200;
  const limit = Math.min(options?.limit ?? 100, maxLimit);
  const firestore = initFirestore();
  const snap = await firestore
    .collection("stories")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();

  let stories = snap.docs.map((doc) => toStory({ id: doc.id, data: () => doc.data() }));
  if (options?.categorySlug) {
    stories = stories.filter((s) => s.categorySlug === options.categorySlug);
  }
  if (process.env.NAME_REPLACEMENT_ENABLED !== "true") {
    return stories;
  }
  const mappings = await getNameMappings();
  return mappings && Object.keys(mappings).length > 0
    ? stories.map((s) => applyNameReplacementsToStory(s, mappings))
    : stories;
}

export async function getPublishedStories(options?: {
  categorySlug?: string;
  limit?: number;
  forSitemap?: boolean;
}): Promise<Story[]> {
  const limit = options?.limit ?? 100;
  const slug = options?.categorySlug ?? "";
  const cacheKey = options?.forSitemap ? ["stories-sitemap"] : ["stories-list", String(limit), slug];
  const revalidate = options?.forSitemap ? 3600 : STORY_REVALIDATE; // sitemap: 1hr
  return unstable_cache(
    () => getPublishedStoriesUncached(options),
    cacheKey,
    { revalidate }
  )();
}

function normalizeStoryId(id: string): string {
  try {
    id = decodeURIComponent(id);
  } catch {
    /* already decoded */
  }
  return id.trim().normalize("NFC");
}

async function getPublishedStoryByIdUncached(id: string): Promise<Story | null> {
  id = normalizeStoryId(id);
  const firestore = initFirestore();
  let docSnap = await firestore.collection("stories").doc(id).get();
  if (!docSnap.exists) {
    let bySlug = await firestore
      .collection("stories")
      .where("slug", "==", id)
      .where("status", "==", "published")
      .limit(1)
      .get();
    if (bySlug.empty && id.includes("-")) {
      const baseSlug = id.replace(/-[a-z0-9]+$/i, "");
      if (baseSlug && baseSlug !== id) {
        bySlug = await firestore
          .collection("stories")
          .where("slug", "==", baseSlug)
          .where("status", "==", "published")
          .limit(1)
          .get();
      }
    }
    if (bySlug.empty) return null;
    docSnap = bySlug.docs[0];
  }
  const data = docSnap.data()!;
  if (data.status !== "published") return null;
  const story = toStory({ id: docSnap.id, data: () => data });
  if (process.env.NAME_REPLACEMENT_ENABLED === "false") {
    return story;
  }
  const mappings = await getNameMappings();
  return mappings && Object.keys(mappings).length > 0
    ? applyNameReplacementsToStory(story, mappings)
    : story;
}

export async function getPublishedStoryById(id: string): Promise<Story | null> {
  return unstable_cache(
    () => getPublishedStoryByIdUncached(id),
    ["story", id],
    { revalidate: STORY_REVALIDATE }
  )();
}
