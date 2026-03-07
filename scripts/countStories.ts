/**
 * Count stories in Firestore.
 * Run: npx tsx scripts/countStories.ts
 */

import { initFirestore } from "./crawler/saveToFirestore";

async function main() {
  const db = initFirestore();
  const all = await db.collection("stories").get();
  const published = await db.collection("stories").where("status", "==", "published").get();
  const draft = await db.collection("stories").where("status", "==", "draft").get();
  console.log("Total stories:", all.size);
  console.log("  Published:", published.size);
  console.log("  Draft:", draft.size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
