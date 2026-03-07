/**
 * Saves crawled stories to Firestore (draft) and publishes them.
 */

import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { transformStoryForBangladesh } from "./bangladeshNames";
import { initFirestore } from "./saveToFirestore";
import { enhanceStorySync, ruleBasedTitle } from "@/lib/aiStoryEnhancer";
import { classifyStory } from "@/lib/storyClassifier";
import { extractCleanHeadline, extractStoryBody } from "@/lib/storyTextExtractor";
import type { CrawledStory } from "./crawlStories";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "story";
}

/**
 * Saves stories as drafts. Returns inserted count.
 */
export async function saveStoriesToFirestore(
  stories: CrawledStory[],
  categorySlug: string,
  options?: { serviceAccountPath?: string }
): Promise<{ inserted: number }> {
  const firestore = initFirestore(options?.serviceAccountPath) as Firestore;
  const col = firestore.collection("stories");
  let inserted = 0;
  const usedSlugs = new Set<string>();

  for (const raw of stories) {
    const s = transformStoryForBangladesh(raw);
    if (!s.body || s.body.length < 50) continue;

    const classification = classifyStory(s.title, s.body);
    if (!classification.isStory) continue;

    const rawTitle = /^মাহ\s*:\s*.+\d{4}|^month\s*:\s*.+\d{4}|^\d{4}$/i.test(s.title.trim())
      ? ruleBasedTitle(s.body)
      : s.title;
    const title = extractCleanHeadline(rawTitle) || rawTitle;
    const body = extractStoryBody(s.body);

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let n = 0;
    while (usedSlugs.has(slug)) {
      n++;
      slug = `${baseSlug}-${n}`;
    }
    usedSlugs.add(slug);

    const enhanced = enhanceStorySync(title, body);

    const doc = {
      title,
      slug,
      body,
      summary: body.slice(0, 150).trim() + (body.length > 150 ? "…" : ""),
      tags: [],
      categorySlug,
      language: "bn",
      lengthType: body.length < 500 ? "short" : body.length < 2000 ? "medium" : "long",
      sourceUrl: s.sourceUrl,
      status: "draft",
      popularityScore: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      headline: enhanced.headline,
      seoTitle: enhanced.seoTitle,
      seoDescription: enhanced.seoDescription,
      hashtags: enhanced.hashtags,
      parts: enhanced.parts,
    };
    await col.add(doc);
    inserted++;
  }
  return { inserted };
}

/**
 * Publishes draft stories. If categorySlug provided, only that category.
 */
export async function publishStories(
  options?: { categorySlug?: string; storyIds?: string[]; serviceAccountPath?: string }
): Promise<{ published: number; total: number; skippedShort: number }> {
  const firestore = initFirestore(options?.serviceAccountPath) as Firestore;
  const col = firestore.collection("stories");
  const now = FieldValue.serverTimestamp();

  const MIN_BODY_LENGTH = 3000;

  if (options?.storyIds?.length) {
    let published = 0;
    let skippedShort = 0;
    for (const id of options.storyIds) {
      const ref = col.doc(id);
      const snap = await ref.get();
      const data = snap.data();
      if (snap.exists && data?.status === "draft") {
        const body = (data.body as string) || "";
        if (body.length <= MIN_BODY_LENGTH) {
          skippedShort++;
          continue;
        }
        await ref.update({ status: "published", updatedAt: now, publishedAt: now });
        published++;
      }
    }
    return { published, total: options.storyIds.length, skippedShort };
  }

  let q = col.where("status", "==", "draft");
  if (options?.categorySlug) {
    q = q.where("categorySlug", "==", options.categorySlug);
  }
  const snap = await q.get();
  const total = snap.docs.length;
  let published = 0;
  let skippedShort = 0;
  const batch = firestore.batch();
  snap.docs.forEach((d) => {
    const body = (d.data().body as string) || "";
    if (body.length <= MIN_BODY_LENGTH) {
      skippedShort++;
      return;
    }
    batch.update(d.ref, { status: "published", updatedAt: now, publishedAt: now });
    published++;
  });
  if (published > 0) await batch.commit();
  return { published, total, skippedShort };
}
