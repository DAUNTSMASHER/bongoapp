/**
 * Saves crawled stories to Firestore (draft) and publishes them.
 */

import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { transformStoryForBangladesh } from "./bangladeshNames";
import { applyNameVariants } from "@/lib/nameVariants";
import { processStoryContent } from "@/lib/storyMLProcessor";
import { initFirestore } from "./saveToFirestore";
import { enhanceStorySync, ruleBasedTitle } from "@/lib/aiStoryEnhancer";
import { getLadyCoverImages } from "@/lib/coverImages";
import { classifyStory } from "@/lib/storyClassifier";
import { extractCleanHeadline, extractStoryBody } from "@/lib/storyTextExtractor";
import type { CrawledStory } from "./crawlStories";
import type { EnrichedCrawledStory } from "./crawlBanglaChotiSmart";

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
 * minBodyLength: minimum body chars to publish (default 3000). Use 600–800 for crawled stories.
 */
export async function publishStories(
  options?: {
    categorySlug?: string;
    storyIds?: string[];
    serviceAccountPath?: string;
    minBodyLength?: number;
  }
): Promise<{ published: number; total: number; skippedShort: number }> {
  const firestore = initFirestore(options?.serviceAccountPath) as Firestore;
  const col = firestore.collection("stories");
  const now = FieldValue.serverTimestamp();

  const MIN_BODY_LENGTH = options?.minBodyLength ?? 3000;

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

/** Get lady cover image paths for new stories (only images of a lady) */
function getCoverImages(): string[] {
  return getLadyCoverImages();
}

/**
 * Saves smart-crawled stories with ML processing. Deduplicates by storyId.
 * When createVariantsOnDuplicate is true, duplicates get name/title variants and are saved as new.
 * When assignCoverImages is true, assigns a random cover from public/story_cover/.
 * Returns { inserted, skipped }.
 */
export async function saveSmartStoriesToFirestore(
  stories: EnrichedCrawledStory[],
  defaultCategorySlug: string,
  options?: {
    serviceAccountPath?: string;
    createVariantsOnDuplicate?: boolean;
    assignCoverImages?: boolean;
  }
): Promise<{ inserted: number; skipped: number }> {
  const firestore = initFirestore(options?.serviceAccountPath) as Firestore;
  const col = firestore.collection("stories");
  const createVariants = options?.createVariantsOnDuplicate ?? false;
  const assignCovers = options?.assignCoverImages ?? false;
  const coverImages = assignCovers ? getCoverImages() : [];
  let inserted = 0;
  let skipped = 0;
  const usedSlugs = new Set<string>();

  for (const raw of stories) {
    let s = transformStoryForBangladesh(raw);
    if (!s.body || s.body.length < 50) {
      skipped++;
      continue;
    }

    const enriched = raw as EnrichedCrawledStory;
    let storyId = enriched.processed?.storyId;
    let title = s.title;
    let body = s.body;
    let processed = enriched.processed;

    const categorySlug = enriched.categorySlug || defaultCategorySlug;

    if (storyId) {
      const existing = await col.where("storyId", "==", storyId).limit(1).get();
      if (!existing.empty && createVariants) {
        const { body: newBody, title: newTitle } = applyNameVariants(body, title);
        const reprocessed = processStoryContent(newBody, newTitle);
        const newStoryId = reprocessed.storyId;
        const newExisting = await col.where("storyId", "==", newStoryId).limit(1).get();
        if (newExisting.empty) {
          body = newBody;
          title = newTitle;
          storyId = newStoryId;
          processed = reprocessed;
        } else {
          skipped++;
          continue;
        }
      } else if (!existing.empty) {
        skipped++;
        continue;
      }
    }

    const classification = classifyStory(title, body);
    if (!classification.isStory) {
      skipped++;
      continue;
    }

    const rawTitle = /^মাহ\s*:\s*.+\d{4}|^month\s*:\s*.+\d{4}|^\d{4}$/i.test(title.trim())
      ? ruleBasedTitle(body)
      : title;
    const finalTitle = extractCleanHeadline(rawTitle) || title;
    const finalBody = extractStoryBody(body);

    const baseSlug = slugify(finalTitle);
    let slug = baseSlug;
    let n = 0;
    while (usedSlugs.has(slug)) {
      n++;
      slug = `${baseSlug}-${n}`;
    }
    usedSlugs.add(slug);

    const enhanced = enhanceStorySync(finalTitle, finalBody);

    const blocks = processed?.blocks?.length ? processed.blocks : enhanced.parts || [];
    const characterCount = processed?.characterCount ?? 0;
    const blockCount = blocks.length;

    const doc: Record<string, unknown> = {
      title: finalTitle,
      slug,
      headline: processed?.headline || enhanced.headline,
      body: finalBody,
      bodyCharCount: finalBody.length,
      summary: finalBody.slice(0, 150).trim() + (finalBody.length > 150 ? "…" : ""),
      tags: [
        ...(enriched.sourceTags?.slice(0, 8) || []),
        ...(processed?.eroticTags?.slice(0, 10) || []),
      ]
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .slice(0, 15),
      categorySlug,
      language: "bn",
      lengthType: finalBody.length < 500 ? "short" : finalBody.length < 2000 ? "medium" : "long",
      sourceUrl: s.sourceUrl,
      status: "draft",
      popularityScore: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      seoTitle: enhanced.seoTitle,
      seoDescription: enhanced.seoDescription,
      hashtags: enhanced.hashtags,
      parts: blocks,
      blocks,
      blockCount,
      characterCount,
      characterNames: processed?.characterNames || [],
      eroticTags: processed?.eroticTags || [],
      storyId: storyId || null,
    };
    if (coverImages.length) {
      (doc as Record<string, unknown>).coverImageUrl =
        coverImages[Math.floor(Math.random() * coverImages.length)];
    }

    await col.add(doc);
    inserted++;
  }
  return { inserted, skipped };
}
