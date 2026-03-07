/**
 * Assign cover images to published stories in Firestore.
 * Run: npx tsx scripts/assignCoverImages.ts
 *
 * Uses images from public/story-covers/ (cover-001.png, cover-002.png, etc.)
 * and assigns them round-robin to published stories.
 */

import * as fs from "fs";
import * as path from "path";
import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";

const COVERS_DIR = path.join(process.cwd(), "public", "story-covers");
const COVER_IMAGES = fs.existsSync(COVERS_DIR)
  ? fs
      .readdirSync(COVERS_DIR)
      .filter((f) => f.endsWith(".png") && f.startsWith("cover-"))
      .sort()
      .map((f) => `/story-covers/${f}`)
  : [];

async function main() {
  if (COVER_IMAGES.length === 0) {
    console.log("No cover images in public/story-covers/. Add PNG files first.");
    return;
  }
  console.log(`Found ${COVER_IMAGES.length} cover images.`);

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
    chunk.forEach((doc, j) => {
      const coverUrl = COVER_IMAGES[(i + j) % COVER_IMAGES.length];
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
