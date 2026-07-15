import { initFirestore } from "./crawler/saveToFirestore";

async function main() {
  const db = initFirestore();
  const snap = await db.collection("stories")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(10)
    .get();

  console.log(`Top ${snap.size} stories by publishedAt DESC:`);
  snap.docs.forEach((doc) => {
    const data = doc.data();
    console.log(`- [${doc.id.slice(0, 20)}...] ${data.title?.slice(0, 30)} (Date: ${data.publishedAt?.toDate?.()?.toISOString()})`);
  });
}

main().catch(console.error);
