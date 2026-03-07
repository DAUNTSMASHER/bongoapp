/**
 * Randomly redistribute published stories across categories.
 * Run: npx tsx scripts/redistributeCategories.ts
 *
 * Ensures each category gets a fair share of stories (real Firestore data).
 */

import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";
import { CATEGORIES } from "../lib/stories";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const slugs = CATEGORIES.map((c) => c.slug);
  const firestore = initFirestore();
  const snap = await firestore
    .collection("stories")
    .where("status", "==", "published")
    .get();

  if (snap.empty) {
    console.log("No published stories found.");
    return;
  }

  const docs = snap.docs;
  const shuffledSlugs = shuffle(slugs);

  const BATCH_SIZE = 500;
  let updated = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = firestore.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach((doc, j) => {
      const categorySlug = shuffledSlugs[(i + j) % shuffledSlugs.length];
      batch.update(doc.ref, {
        categorySlug,
        updatedAt: FieldValue.serverTimestamp(),
      });
      updated++;
    });
    await batch.commit();
  }

  console.log(`Redistributed ${updated} stories across ${slugs.length} categories.`);
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
