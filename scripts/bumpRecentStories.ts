import { initFirestore } from "./crawler/saveToFirestore";
import { FieldValue } from "firebase-admin/firestore";

async function main() {
  const db = initFirestore();
  const col = db.collection("stories");

  // Find stories from April 9, 2026
  const snap = await col.where("status", "==", "published").get();
  const aprilStories = snap.docs.filter(d => {
    const data = d.data();
    const pub = data.publishedAt?.toDate?.();
    return pub && pub.getMonth() === 3 && pub.getFullYear() === 2026 && pub.getDate() === 9;
  });

  if (aprilStories.length === 0) {
    console.log("No stories found from April 9, 2026.");
    return;
  }

  console.log(`Found ${aprilStories.length} stories to bump.`);
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  // We want to sort them so the "very latest" one is on top.
  // We'll update them one by one with slightly different times if possible,
  // but FieldValue.serverTimestamp() will set the same time for all in a batch.
  // Actually, for individual bump, we can just use the batch.
  
  aprilStories.forEach((doc, i) => {
    console.log(`Bumping story: ${doc.id}`);
    batch.update(doc.ref, { 
      publishedAt: now,
      updatedAt: now,
      // Ensure featured stories have a cover image if missing
      ...(doc.data().coverImageUrl ? {} : { coverImageUrl: "/logo.png" })
    });
  });

  await batch.commit();
  console.log("Bump completed successfully.");
}

main().catch(console.error);
