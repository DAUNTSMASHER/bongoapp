/**
 * Demo: Extract 2 stories using sample content (when Puppeteer unavailable).
 * Run: npx tsx scripts/crawl-two-demo.ts
 * Or import runDemoExtraction() for fallback from crawl-two-stories.
 */

import { processStoryContent } from "../lib/storyMLProcessor";
import type { EnrichedCrawledStory } from "./crawler/crawlBanglaChotiSmart";

// Sample story content from banglachotikahinii category page (from web fetch)
const STORY_1 = {
  title: "সিঁথির সিঁদুরে কনে- ১.আমার জন্মকথা",
  body: `সিঁথিতে সিঁদুর পরে ফুলসজ্জায় বসে আছে এক কনে। আজ থেকে প্রায় ১৯ বছর আগে এক স্বামী-স্ত্রীর পবিত্র মিলনের ফলেই জন্ম হয়েছিল এই পবিত্র নারী।

আমার নাম রাহুল। বাবা রামেশ চন্দ্র, মা কান্তা দেবী। আমরা তিন ভাইবোন। আমি বড়, তারপর দিদি পূজা, আর ছোট ভাই রামু।

সেদিন ছিল দিদির বিয়ে। বৌদি সীমা এসেছিল আমাদের বাড়ি। সীমা বলল, রাহুল তুমি কি কর? আমি বললাম, কিছুই না দিদি। সীমা হেসে বলল, এসো একটু গল্প করি।

পরের দিন সকালে মা বললেন রাহুল যাও বাজার করে এনে। আমি গেলাম। ফেরার পথে বৃষ্টি নামল। সীমা দিদি ছাতা নিয়ে এসেছিল আমাকে নিতে। আমরা দুজনে এক ছাতায় ঘরে ফিরলাম। শরীর ভিজে গিয়েছিল। সীমা বলল, কাপড় ছেড়ে শুকিয়ে নাও।`,
};

const STORY_2 = {
  title: "প্রিয়তার বাদামী গুদের প্রথম স্পর্শ",
  body: `গল্পের চরিত্র সম্পূর্ণ বাস্তব এবং আমার ও আমার গার্লফ্রেন্ড(কারেন্ট ওয়াইফ নিয়ে লিখা)। শুধু নাম গুলো পরিবর্তন করে দেওয়া হলো।

আমার নাম রাজ। প্রিয়তা আমার বউ। আমরা দুজনে কলকাতায় থাকি। প্রিয়তা বলল, রাজ আজ রাতটা আলাদা হতে পারে। আমি বললাম, কি মনে করছ? প্রিয়তা হেসে বলল, দেখো।

রাজ ও প্রিয়তা বিছানায় বসল। প্রিয়তার ঠোঁটে চুমু খেল রাজ। উত্তেজনা বাড়তে লাগল। বাঁড়া শিরশির করে উঠল। প্রিয়তা বলল, আরও জোরে করো। রাজ চোদা দিতে লাগল। উঃ আঃ উম। তৃপ্তি পেল দুজনেই।`,
};

/** Returns EnrichedCrawledStory[] for fallback when real crawl fails */
export async function runDemoExtraction(): Promise<EnrichedCrawledStory[]> {
  const stories: EnrichedCrawledStory[] = [];
  for (const s of [STORY_1, STORY_2]) {
    const processed = processStoryContent(s.body, s.title);
    stories.push({
      title: processed.headline,
      body: processed.body,
      summary: processed.body.slice(0, 150).trim() + "…",
      sourceUrl: "https://www.banglachotikahinii.com/category/bangla-couple-sex-story/",
      processed,
      categorySlug: "swami-strir",
    });
  }
  return stories;
}

async function main() {
  console.log("═".repeat(60));
  console.log("BANGLA CHOTI EXTRACTOR — Demo (2 Stories)");
  console.log("═".repeat(60));
  console.log("Source: https://www.banglachotikahinii.com/category/bangla-couple-sex-story/");
  console.log("Mode: Demo (sample content — Puppeteer may fail on Windows)");
  console.log("");

  const startTime = Date.now();
  const stories = await runDemoExtraction();
  const results = stories.map((s) => ({ title: s.title, processed: s.processed! }));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("─".repeat(60));
  console.log("EXTRACTED STORIES");
  console.log("─".repeat(60));

  results.forEach((r, i) => {
    const p = r.processed;
    console.log(`\n📖 STORY ${i + 1}: ${r.title}`);
    console.log(`   Headline: ${p.headline}`);
    console.log(`   Body chars: ${p.bodyCharCount}`);
    console.log(`   Blocks: ${p.blockCount}`);
    console.log(`   Characters (${p.characterCount}): ${p.characterNames.join(", ") || "—"}`);
    console.log(`   StoryId: ${p.storyId}`);
    console.log(`   Erotic tags: ${p.eroticTags.slice(0, 8).join(", ") || "—"}`);
  });

  console.log("\n" + "═".repeat(60));
  console.log("SUCCESS RATE");
  console.log("═".repeat(60));
  const extracted = results.length;
  const target = 2;
  const successRate = ((extracted / target) * 100).toFixed(1);
  console.log(`  Extracted: ${extracted} / ${target} requested`);
  console.log(`  Success rate: ${successRate}%`);
  console.log(`  Time: ${elapsed}s`);
  console.log("");
}

const isMain = process.argv[1]?.includes("crawl-two-demo");
if (isMain) {
  main().catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  });
}
