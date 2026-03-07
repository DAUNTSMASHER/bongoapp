/**
 * CLI: Delete stories from Firestore before re-crawling.
 *
 *   npm run delete:stories -- --all
 *   npm run delete:stories -- grihobodhur
 */

import { initFirestore } from "./saveToFirestore";

async function main() {
  const args = process.argv.slice(2);
  const deleteAll = args.includes("--all");
  const categorySlug = args.find((a) => a !== "--all") || null;

  const firestore = initFirestore();

  if (deleteAll) {
    const snap = await firestore.collection("stories").get();
    if (snap.empty) {
      console.log("No stories to delete.");
      return;
    }
    const batchSize = 500;
    let deleted = 0;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = firestore.batch();
      const chunk = docs.slice(i, i + batchSize);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deleted += chunk.length;
      console.log(`  Deleted ${deleted}/${docs.length}...`);
    }
    console.log(`Done. Deleted ${deleted} story/stories.`);
    return;
  }

  if (categorySlug) {
    const snap = await firestore
      .collection("stories")
      .where("categorySlug", "==", categorySlug)
      .get();
    if (snap.empty) {
      console.log(`No stories in category "${categorySlug}".`);
      return;
    }
    const batch = firestore.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log(`Deleted ${snap.size} story/stories in category "${categorySlug}".`);
    return;
  }

  console.log("Usage:");
  console.log("  npm run delete:stories -- --all           # Delete ALL stories");
  console.log("  npm run delete:stories -- grihobodhur     # Delete by category");
}

main().catch((e) => {
  console.error("Delete failed:", e);
  process.exit(1);
});
