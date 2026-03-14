/**
 * Fix all published stories: reassign cover images (round-robin) and uniformly distribute categories.
 * Run: npx tsx scripts/fixStoriesCoversAndCategories.ts
 *
 * Use after manually adding stories or when covers/categories need refresh.
 */

import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";
import { getLadyCoverImages } from "@/lib/coverImages";
import { CATEGORIES } from "@/lib/stories";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const COVER_IMAGES = getLadyCoverImages();
  if (COVER_IMAGES.length === 0) {
    console.log("No cover images. Add images to public/story_cover/ first.");
    return;
  }

  const firestore = initFirestore();
  const col = firestore.collection("stories");
  const snap = await col.where("status", "==", "published").get();

  if (snap.empty) {
    console.log("No published stories found.");
    return;
  }

  const docs = snap.docs;
  const categorySlugs = CATEGORIES.map((c) => c.slug);
  const shuffledCategories = shuffle(categorySlugs);

  const BATCH_SIZE = 400;
  let updated = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = firestore.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach((doc, j) => {
      const idx = i + j;
      const coverUrl = COVER_IMAGES[idx % COVER_IMAGES.length];
      const categorySlug = shuffledCategories[idx % shuffledCategories.length];
      batch.update(doc.ref, {
        coverImageUrl: coverUrl,
        categorySlug,
        updatedAt: FieldValue.serverTimestamp(),
      });
      updated++;
    });
    await batch.commit();
    if (i + BATCH_SIZE < docs.length) {
      process.stdout.write(`\rUpdated ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length}...`);
    }
  }

  console.log(`\n✓ Fixed ${updated} stories: covers (${COVER_IMAGES.length} images) + categories (${categorySlugs.length} categories).`);
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
