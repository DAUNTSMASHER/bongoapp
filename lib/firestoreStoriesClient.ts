"use client";

import {
  collection,
  getDocs,
  query,
  where,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { applyNameReplacementsToStory, type NameMappings } from "./nameReplacement";
import type { Story } from "@/types/story";

function toStory(docSnap: { id: string; data: () => Record<string, unknown> }): Story {
  const d = docSnap.data();
  const createdAt = (d.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date();
  const updatedAt = (d.updatedAt as { toDate?: () => Date })?.toDate?.() ?? createdAt;
  const publishedAt = (d.publishedAt as { toDate?: () => Date })?.toDate?.();
  return {
    id: docSnap.id,
    title: (d.title as string) || "Untitled",
    slug: (d.slug as string) || docSnap.id,
    body: (d.body as string) || "",
    summary: d.summary as string | undefined,
    coverImageUrl: d.coverImageUrl as string | undefined,
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

async function fetchNameMappings(): Promise<NameMappings> {
  try {
    const res = await fetch("/api/name-mappings");
    const data = await res.json();
    return (data.mappings || {}) as NameMappings;
  } catch {
    return {};
  }
}

/**
 * Fetch published stories from Firestore (client-side).
 * Works on Vercel without FIREBASE_SERVICE_ACCOUNT.
 */
export async function getPublishedStoriesFromFirestore(options?: {
  categorySlug?: string;
  limitCount?: number;
}): Promise<Story[]> {
  const limitCount = Math.min(options?.limitCount ?? 100, 200);
  const col = collection(db, "stories");
  const constraints = [where("status", "==", "published")];
  if (options?.categorySlug) {
    constraints.push(where("categorySlug", "==", options.categorySlug));
  }
  const q = query(col, ...constraints, limit(limitCount));
  const snap = await getDocs(q);
  let stories = snap.docs
    .map((d) => toStory({ id: d.id, data: () => d.data() }))
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? b.createdAt.getTime()) -
        (a.publishedAt?.getTime() ?? a.createdAt.getTime())
    );
  const mappings = await fetchNameMappings();
  if (mappings && Object.keys(mappings).length > 0) {
    stories = stories.map((s) => applyNameReplacementsToStory(s, mappings));
  }
  return stories;
}

/**
 * Fetch one published story by ID (client-side).
 */
export async function getPublishedStoryByIdFromFirestore(
  id: string
): Promise<Story | null> {
  const docRef = doc(db, "stories", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const d = snap.data();
  if (d.status !== "published") return null;
  const story = toStory({ id: snap.id, data: () => d });
  const mappings = await fetchNameMappings();
  return mappings && Object.keys(mappings).length > 0
    ? applyNameReplacementsToStory(story, mappings)
    : story;
}
