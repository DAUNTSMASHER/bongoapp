#!/usr/bin/env npx tsx
/**
 * Re-fetches all saved stories from their sourceUrl, applies clean headline/body
 * extraction, and updates Firestore. If sourceUrl has no story structure,
 * navigates through links to find the full story.
 *
 * Usage:
 *   npm run refresh-stories
 *   npm run refresh-stories -- --limit 5
 *   npm run refresh-stories -- --dry-run
 *   npm run refresh-stories -- --puppeteer   # use Puppeteer (avoids 403 from bot-blocking sites)
 *   npm run refresh-stories -- --status published
 */

import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";
import { fetchAndExtractStory } from "./crawler/crawlStories";
import { enhanceStorySync, ruleBasedTitle } from "@/lib/aiStoryEnhancer";
import { classifyStory } from "@/lib/storyClassifier";
import { extractCleanHeadline, extractStoryBody } from "@/lib/storyTextExtractor";

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
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1] || "9999", 10) : 9999;
  const dryRun = args.includes("--dry-run");
  const usePuppeteer = args.includes("--puppeteer");
  const statusFilter = args.includes("--status") ? args[args.indexOf("--status") + 1] : null;

  console.log("\n" + "═".repeat(70));
  console.log("  REFRESH STORIES FROM SOURCE");
  console.log("═".repeat(70));
  console.log(`  Limit: ${limit} | Dry run: ${dryRun} | Puppeteer: ${usePuppeteer} | Status: ${statusFilter || "all"}`);
  console.log("─".repeat(70) + "\n");

  const firestore = initFirestore() as Firestore;
  const col = firestore.collection("stories");

  let snap;
  try {
    if (statusFilter) {
      snap = await col.where("status", "==", statusFilter).limit(limit * 2).get();
    } else {
      snap = await col.orderBy("updatedAt", "desc").limit(limit * 2).get();
    }
  } catch (e) {
    if (String(e).includes("index")) {
      snap = await col.limit(limit * 2).get();
    } else throw e;
  }
  const docs = snap.docs.slice(0, limit);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const d = doc.data();
    const sourceUrl = d.sourceUrl as string | undefined;
    const oldTitle = (d.title || "").trim();
    const oldHeadline = (d.headline || "").trim();

    if (!sourceUrl || !sourceUrl.startsWith("http")) {
      console.log(`[${i + 1}/${docs.length}] ${doc.id} – SKIP (no sourceUrl)`);
      skipped++;
      continue;
    }

    const shortUrl = sourceUrl.length > 55 ? sourceUrl.slice(0, 52) + "..." : sourceUrl;
    console.log(`[${i + 1}/${docs.length}] ${doc.id}`);
    console.log(`  URL: ${shortUrl}`);

    try {
      const story = await fetchAndExtractStory(sourceUrl, {
        usePuppeteer,
        maxNavigateDepth: 3,
      });

      if (!story || !story.body || story.body.length < 100) {
        console.log(`  → SKIP (no story found, body length: ${story?.body?.length || 0})`);
        failed++;
        continue;
      }

      const classification = classifyStory(story.title, story.body);
      if (!classification.isStory) {
        console.log(`  → SKIP (not a story: ${classification.reason})`);
        skipped++;
        continue;
      }

      const rawTitle =
        /^মাহ\s*:\s*.+\d{4}|^month\s*:\s*.+\d{4}|^\d{4}$/i.test(story.title.trim())
          ? ruleBasedTitle(story.body)
          : story.title;
      const title = extractCleanHeadline(rawTitle) || rawTitle;
      const body = extractStoryBody(story.body);
      const enhanced = enhanceStorySync(title, body);

      console.log(`  OLD headline: ${oldHeadline.slice(0, 50)}…`);
      console.log(`  NEW headline: ${enhanced.headline.slice(0, 50)}…`);
      console.log(`  Body: ${body.length} chars`);

      if (!dryRun) {
        const newSlug = slugify(title);
        await doc.ref.update({
          title,
          headline: enhanced.headline,
          seoTitle: enhanced.seoTitle,
          seoDescription: enhanced.seoDescription,
          body,
          summary: body.slice(0, 150).trim() + (body.length > 150 ? "…" : ""),
          hashtags: enhanced.hashtags,
          parts: enhanced.parts,
          lengthType: body.length < 500 ? "short" : body.length < 2000 ? "medium" : "long",
          sourceUrl: story.sourceUrl,
          slug: newSlug,
          updatedAt: FieldValue.serverTimestamp(),
        });
        updated++;
      }
    } catch (e) {
      console.log(`  → ERROR: ${String(e).slice(0, 80)}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 800));
  }

  console.log("\n" + "═".repeat(70));
  console.log("  SUMMARY");
  console.log("═".repeat(70));
  console.log(`  Processed: ${docs.length}`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);
  if (dryRun) {
    console.log("\n  💡 Run without --dry-run to apply changes to Firestore");
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
