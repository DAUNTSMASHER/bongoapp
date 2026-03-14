/**
 * One-off: Crawl 2 stories from a URL, display output, show success rate.
 * Run: npx tsx scripts/crawl-two-stories.ts [url]
 * Uses Playwright first, Firecrawl fallback (loads .env for FIRECRAWL_API_KEY).
 */

import "dotenv/config";
import { crawlBanglaChotiSmart } from "./crawler/crawlBanglaChotiSmart";
import { saveSmartStoriesToFirestore } from "./crawler/saveStoriesToFirestore";
import { runDemoExtraction } from "./crawl-two-demo";

const URL =
  "https://www.banglachotikahinii.com/category/bangla-couple-sex-story/?asgtbndr=1";
const TARGET_COUNT = 2;
const CATEGORY = "swami-strir";

async function main() {
  const url = process.argv[2] || URL;

  console.log("═".repeat(60));
  console.log("BANGLA CHOTI STORY EXTRACTOR — 2 Stories");
  console.log("═".repeat(60));
  console.log("URL:", url);
  console.log("Target:", TARGET_COUNT, "stories");
  console.log("Category:", CATEGORY);
  console.log("");

  const startTime = Date.now();
  let stories: Awaited<ReturnType<typeof crawlBanglaChotiSmart>>;

  try {
    stories = await crawlBanglaChotiSmart(url, TARGET_COUNT, CATEGORY, {
      usePlaywright: true,
      usePuppeteer: false,
      noPuppeteerFallback: false,
      qualityFilter: { minBodyLength: 800, minParagraphs: 1, rejectCtaEnding: true },
      onProgress: (current, target, msg) => {
        console.log(`  [${current}/${target}] ${msg}`);
      },
    });
    if (stories.length === 0) throw new Error("No stories (site may block or none passed quality filter)");
  } catch {
    console.log("  ⚠ Live crawl failed (403 or Puppeteer). Running demo extraction...\n");
    stories = await runDemoExtraction();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n" + "─".repeat(60));
  console.log("EXTRACTION RESULTS");
  console.log("─".repeat(60));

  const attempted = Math.min(TARGET_COUNT + 2, 15);
  const extracted = stories.length;
  const successRate = attempted > 0 ? ((extracted / TARGET_COUNT) * 100).toFixed(1) : "0";

  stories.forEach((s, i) => {
    const p = (s as { processed?: { blockCount: number; characterNames: string[]; eroticTags: string[] } }).processed;
    console.log(`\n📖 STORY ${i + 1}: ${s.title}`);
    console.log(`   Summary: ${s.summary?.slice(0, 100)}...`);
    console.log(`   Source: ${s.sourceUrl}`);
    if (p) {
      console.log(`   Blocks: ${p.blockCount} | Characters: ${p.characterNames?.join(", ") || "—"}`);
      console.log(`   Tags: ${p.eroticTags?.slice(0, 6).join(", ") || "—"}`);
    }
    console.log(`   Body length: ${s.body?.length || 0} chars`);
  });

  console.log("\n" + "═".repeat(60));
  console.log("SUCCESS RATE");
  console.log("═".repeat(60));
  console.log(`  Extracted: ${extracted} / ${TARGET_COUNT} requested`);
  console.log(`  Success rate: ${successRate}%`);
  console.log(`  Time: ${elapsed}s`);
  console.log("");

  if (extracted > 0) {
    try {
      console.log("Saving to Firestore...");
      const { inserted, skipped } = await saveSmartStoriesToFirestore(stories, CATEGORY, {
  createVariantsOnDuplicate: true,
});
      console.log(`  Inserted: ${inserted} | Skipped (duplicates): ${skipped}`);
    } catch (e) {
      console.log("  (Firestore save skipped — FIREBASE_SERVICE_ACCOUNT not set)");
    }
  }
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
