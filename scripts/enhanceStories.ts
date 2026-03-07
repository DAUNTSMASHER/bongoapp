/**
 * Enhance existing stories with headlines, SEO, hashtags, and part splits.
 * Uses sync rule-based logic (no AI API calls) for batch processing.
 *
 * Run: npx tsx scripts/enhanceStories.ts
 * Or:  npx tsx scripts/enhanceStories.ts --limit 50
 * Or:  npx tsx scripts/enhanceStories.ts --dry-run
 */

import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";
import { enhanceStorySync } from "../lib/aiStoryEnhancer";

async function main() {
  const limit = process.argv.includes("--limit")
    ? parseInt(process.argv[process.argv.indexOf("--limit") + 1] || "20", 10)
    : 50;
  const dryRun = process.argv.includes("--dry-run");

  const firestore = initFirestore();
  const col = firestore.collection("stories");

  const snap = await col
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limit * 2)
    .get();

  const toProcess = snap.docs.filter((d) => {
    const data = d.data();
    return !data.headline || !Array.isArray(data.parts) || (data.parts?.length ?? 0) < 2;
  }).slice(0, limit);

  console.log(`Found ${toProcess.length} stories to enhance (limit=${limit}, dryRun=${dryRun})\n`);

  let enhanced = 0;
  for (const doc of toProcess) {
    const d = doc.data();
    const title = d.title || "Untitled";
    const body = d.body || "";
    if (!body || body.length < 50) {
      console.log(`  Skip ${doc.id}: body too short`);
      continue;
    }

    const result = enhanceStorySync(title, body);
    console.log(`  ${doc.id}`);
    console.log(`    Headline: ${result.headline.slice(0, 50)}…`);
    console.log(`    Parts: ${result.parts.length}`);
    console.log(`    Hashtags: ${result.hashtags.join(", ")}`);

    if (!dryRun) {
      await doc.ref.update({
        headline: result.headline,
        seoTitle: result.seoTitle,
        seoDescription: result.seoDescription,
        hashtags: result.hashtags,
        parts: result.parts,
        updatedAt: FieldValue.serverTimestamp(),
      });
      enhanced++;
    }
  }

  console.log(`\nDone. Enhanced: ${dryRun ? "0 (dry run)" : enhanced}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
