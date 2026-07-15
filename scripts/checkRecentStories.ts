import { initFirestore } from "./crawler/saveToFirestore";

async function main() {
  const db = initFirestore();
  const snap = await db.collection("stories")
    .where("status", "==", "published")
    .get();

  const aprilStories = snap.docs.filter(d => {
    const data = d.data();
    const pub = data.publishedAt?.toDate?.();
    return pub && pub.getMonth() === 3 && pub.getFullYear() === 2026 && pub.getDate() === 9;
  });

  console.log(`Found ${aprilStories.length} stories from April 9, 2026.`);
  aprilStories.forEach((doc) => {
    const data = doc.data();
    const pub = data.publishedAt;
    console.log(`- ID: ${doc.id}`);
    console.log(`  PublishedAt Type: ${typeof pub}`);
    console.log(`  PublishedAt Prototype: ${Object.prototype.toString.call(pub)}`);
    if (pub && typeof pub.toDate === "function") {
       console.log(`  PublishedAt toDate(): ${pub.toDate().toISOString()}`);
    } else {
       console.log(`  PublishedAt Value: ${pub}`);
    }
    console.log("---");
  });
}

main().catch(console.error);
