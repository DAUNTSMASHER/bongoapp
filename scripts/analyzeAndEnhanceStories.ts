#!/usr/bin/env npx tsx
/**
 * Analyze stories, classify (story vs non-story), generate new titles, enhance.
 * Shows live proof in terminal before saving.
 *
 * Run: npx tsx scripts/analyzeAndEnhanceStories.ts
 *      npx tsx scripts/analyzeAndEnhanceStories.ts --limit 5
 *      npx tsx scripts/analyzeAndEnhanceStories.ts --save
 */

import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";
import { classifyStory } from "../lib/storyClassifier";
import {
  enhanceStorySync,
  enhanceStory,
  generateStoryTitle,
  ruleBasedTitle,
} from "../lib/aiStoryEnhancer";
import { extractCleanHeadline, extractStoryBody } from "../lib/storyTextExtractor";

const SEP = "─".repeat(70);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "story";
}

async function main() {
  const limit = process.argv.includes("--limit")
    ? parseInt(process.argv[process.argv.indexOf("--limit") + 1] || "10", 10)
    : 10;
  const dryRun = !process.argv.includes("--save");
  const useAI = !!process.env.HUGGINGFACE_API_KEY;

  console.log("\n" + "═".repeat(70));
  console.log("  STORY ANALYZER & ENHANCER — Live Proof");
  console.log("═".repeat(70));
  console.log(`  Limit: ${limit} | Dry run: ${dryRun} | AI titles: ${useAI ? "yes" : "rule-based"}`);
  console.log(SEP + "\n");

  const firestore = initFirestore();
  const col = firestore.collection("stories");

  let snap;
  try {
    snap = await col.where("status", "==", "published").orderBy("publishedAt", "desc").limit(limit * 2).get();
  } catch {
    snap = await col.where("status", "==", "published").limit(limit * 2).get();
  }

  const docs = snap.docs.slice(0, limit);
  let enhanced = 0;
  let hidden = 0;
  let skipped = 0;

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const d = doc.data();
    const oldTitle = (d.title || "Untitled").trim();
    const body = (d.body || "").trim();

    console.log(`\n[${i + 1}/${docs.length}] Doc: ${doc.id}`);
    console.log(SEP);

    // 1. Classify
    const classification = classifyStory(oldTitle, body);
    console.log(`\n  📋 CLASSIFICATION`);
    console.log(`     Is story: ${classification.isStory ? "✅ YES" : "❌ NO"}`);
    console.log(`     Reason:   ${classification.reason}`);

    if (!classification.isStory) {
      console.log(`\n  ⏭️  SKIP (will hide if --save)`);
      if (!dryRun) {
        await doc.ref.update({
          status: "hidden",
          hiddenReason: classification.reason,
          updatedAt: FieldValue.serverTimestamp(),
        });
        hidden++;
      }
      skipped++;
      continue;
    }

    // 2. Generate new title (clean: no by/date/stats/part numbers)
    let newTitle = extractCleanHeadline(oldTitle) || oldTitle;
    if (useAI) {
      const aiTitle = await generateStoryTitle(body, oldTitle);
      if (aiTitle) newTitle = extractCleanHeadline(aiTitle) || aiTitle;
      else newTitle = ruleBasedTitle(body);
    } else {
      newTitle = ruleBasedTitle(body);
    }

    // 3. Clean body (strip comment/subscribe CTA) and enhance
    const cleanBody = extractStoryBody(body);
    const enhancedData = useAI ? await enhanceStory(newTitle, cleanBody) : enhanceStorySync(newTitle, cleanBody);

    // 4. Show before/after
    console.log(`\n  📝 TITLE`);
    console.log(`     BEFORE: ${oldTitle}`);
    console.log(`     AFTER:  ${newTitle}`);

    console.log(`\n  📄 HEADLINE: ${enhancedData.headline.slice(0, 60)}…`);
    console.log(`  📑 PARTS: ${enhancedData.parts.length}`);
    console.log(`  #️⃣  HASHTAGS: ${enhancedData.hashtags.join(", ")}`);

    const newSlug = slugify(newTitle);

    console.log(`\n  ✨ ENHANCED FIELDS`);
    console.log(`     title, headline, seoTitle, seoDescription`);
    console.log(`     hashtags, parts (${enhancedData.parts.length}), slug`);

    if (!dryRun) {
      await doc.ref.update({
        title: newTitle,
        slug: newSlug,
        body: cleanBody,
        headline: enhancedData.headline,
        seoTitle: enhancedData.seoTitle,
        seoDescription: enhancedData.seoDescription,
        hashtags: enhancedData.hashtags,
        parts: enhancedData.parts,
        summary: cleanBody.slice(0, 150).trim() + (cleanBody.length > 150 ? "…" : ""),
        updatedAt: FieldValue.serverTimestamp(),
      });
      enhanced++;
    }
  }

  console.log("\n" + "═".repeat(70));
  console.log("  SUMMARY");
  console.log("═".repeat(70));
  console.log(`  Processed: ${docs.length}`);
  console.log(`  Enhanced:  ${enhanced}`);
  console.log(`  Hidden:    ${hidden} (non-stories)`);
  console.log(`  Skipped:   ${skipped}`);
  if (dryRun) {
    console.log(`\n  💡 Run with --save to apply changes to Firestore`);
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
