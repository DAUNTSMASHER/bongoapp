/**
 * Assign cover images to published stories in Firestore.
 * Run: npx tsx scripts/assignCoverImages.ts
 *
 * Uses images from public/story_cover/ (bongochoti_online_golpo_01.png, etc).
 * One random image per story. Add or replace images in story_cover/ - they are picked up on next run.
 */

import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";
import { getLadyCoverImages } from "@/lib/coverImages";

const COVER_IMAGES = getLadyCoverImages();

async function main() {
  if (COVER_IMAGES.length === 0) {
    console.log(
      "No cover images. Add images to public/story_cover/ (bongochoti_online_golpo_01.png, etc.)"
    );
    return;
  }
  console.log(`Found ${COVER_IMAGES.length} cover images in story_cover/.`);

  const firestore = initFirestore();
  const col = firestore.collection("stories");
  const snap = await col.where("status", "==", "published").get();

  if (snap.empty) {
    console.log("No published stories found. Run crawl:stories with --publish first.");
    return;
  }

  const BATCH_SIZE = 500;
  const docs = snap.docs;
  let updated = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = firestore.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach((doc) => {
      const coverUrl = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];
      batch.update(doc.ref, { coverImageUrl: coverUrl, updatedAt: FieldValue.serverTimestamp() });
      updated++;
    });
    await batch.commit();
  }

  console.log(`Assigned cover images to ${updated} story/stories.`);
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
