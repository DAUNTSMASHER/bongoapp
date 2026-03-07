/**
 * Server-side: fetch published stories from Firestore.
 * Used by RSC pages to show crawled stories on the site.
 */

import { initFirestore } from "@/scripts/crawler/saveToFirestore";
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
  };
}

export async function getPublishedStories(options?: {
  categorySlug?: string;
  limit?: number;
}): Promise<Story[]> {
  const limit = Math.min(options?.limit ?? 100, 200);
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
  return stories;
}

export async function getPublishedStoryById(id: string): Promise<Story | null> {
  const firestore = initFirestore();
  const doc = await firestore.collection("stories").doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  if (data.status !== "published") return null;
  return toStory({ id: doc.id, data: () => data });
}
