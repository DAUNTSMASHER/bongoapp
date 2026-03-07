/**
 * Saves crawled stories to Firestore (draft) and publishes them.
 */

import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { initFirestore } from "./saveToFirestore";
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

  for (const s of stories) {
    if (!s.body || s.body.length < 50) continue;
    const baseSlug = slugify(s.title);
    let slug = baseSlug;
    let n = 0;
    while (usedSlugs.has(slug)) {
      n++;
      slug = `${baseSlug}-${n}`;
    }
    usedSlugs.add(slug);

    const doc = {
      title: s.title,
      slug,
      body: s.body,
      summary: s.summary,
      tags: [],
      categorySlug,
      language: "bn",
      lengthType: s.body.length < 500 ? "short" : s.body.length < 2000 ? "medium" : "long",
      sourceUrl: s.sourceUrl,
      status: "draft",
      popularityScore: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
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
): Promise<{ published: number }> {
  const firestore = initFirestore(options?.serviceAccountPath) as Firestore;
  const col = firestore.collection("stories");
  const now = FieldValue.serverTimestamp();

  if (options?.storyIds?.length) {
    let published = 0;
    for (const id of options.storyIds) {
      const ref = col.doc(id);
      const snap = await ref.get();
      if (snap.exists && snap.data()?.status === "draft") {
        await ref.update({ status: "published", updatedAt: now, publishedAt: now });
        published++;
      }
    }
    return { published };
  }

  let q = col.where("status", "==", "draft");
  if (options?.categorySlug) {
    q = q.where("categorySlug", "==", options.categorySlug);
  }
  const snap = await q.get();
  let published = 0;
  const batch = firestore.batch();
  snap.docs.forEach((d) => {
    batch.update(d.ref, { status: "published", updatedAt: now, publishedAt: now });
    published++;
  });
  if (published > 0) await batch.commit();
  return { published };
}
