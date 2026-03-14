/**
 * Publish ALL stories that are not yet published (draft, undefined, or any other status).
 * Run: npx tsx scripts/publish-all-drafts-now.ts
 */

import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";

async function main() {
  const firestore = initFirestore();
  const col = firestore.collection("stories");
  const now = FieldValue.serverTimestamp();

  const snap = await col.get();
  const toPublish = snap.docs.filter((d) => (d.data().status || "draft") !== "published");

  if (toPublish.length === 0) {
    console.log("All stories are already published. Total:", snap.size);
    return;
  }

  const batch = firestore.batch();
  toPublish.forEach((d) => {
    batch.update(d.ref, { status: "published", updatedAt: now, publishedAt: now });
  });
  await batch.commit();

  console.log(`Published ${toPublish.length} story/stories. All ${snap.size} stories are now online.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
