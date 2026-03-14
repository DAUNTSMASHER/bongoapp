#!/usr/bin/env npx tsx
/**
 * One-command SEO crawl: fetches new stories and saves as draft.
 * Run locally for best results (uses Puppeteer). On Vercel, use Admin Dashboard with FIRECRAWL_API_KEY.
 *
 * Usage:
 *   npx tsx scripts/run-seo-crawl.ts
 *   npx tsx scripts/run-seo-crawl.ts --count 30 --category ojachar
 *   npx tsx scripts/run-seo-crawl.ts --publish
 *
 * Options:
 *   --count N     Number of stories (default 20)
 *   --category X  Category slug (default sera)
 *   --publish     Publish immediately after save
 */

const DEFAULT_URL = "https://www.banglachotikahinii.com/";
const DEFAULT_CATEGORY = "sera";
const DEFAULT_COUNT = 20;

async function runSeoCrawl() {
  const args = process.argv.slice(2);
  let count = DEFAULT_COUNT;
  let category = DEFAULT_CATEGORY;
  let publish = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--count" && args[i + 1]) {
      count = Math.min(parseInt(args[i + 1], 10) || DEFAULT_COUNT, 50);
      i++;
    } else if (args[i] === "--category" && args[i + 1]) {
      category = args[i + 1];
      i++;
    } else if (args[i] === "--publish") {
      publish = true;
    }
  }

  console.log(`\n📖 SEO Crawl: ${DEFAULT_URL}`);
  console.log(`   Category: ${category}, Count: ${count}, Publish: ${publish}\n`);

  const { crawlBanglaChotiSmart } = await import("./crawler/crawlBanglaChotiSmart");
  const { saveSmartStoriesToFirestore, publishStories } = await import("./crawler/saveStoriesToFirestore");

  const isVercel = Boolean(process.env.VERCEL);
  if (isVercel && !process.env.FIRECRAWL_API_KEY?.trim()) {
    console.error("❌ On Vercel, set FIRECRAWL_API_KEY. Or run locally: npx tsx scripts/run-seo-crawl.ts");
    process.exit(1);
  }

  const stories = await crawlBanglaChotiSmart(DEFAULT_URL, count, category, {
    useFirecrawl: isVercel || Boolean(process.env.FIRECRAWL_API_KEY),
    usePlaywright: !isVercel,
    noPuppeteerFallback: isVercel,
    qualityFilter: { minBodyLength: 800, minParagraphs: 1, rejectCtaEnding: true },
    onProgress: (cur, tot, msg) => console.log(`  ${msg}`),
  });

  if (stories.length === 0) {
    console.log("No stories extracted. Check URL or try locally with Puppeteer.");
    process.exit(0);
  }

  const { inserted, skipped, updated } = await saveSmartStoriesToFirestore(stories, category, {
    forceUpsert: true,
    assignCoverImages: true,
  });

  console.log(`\n✅ Done: ${stories.length} extracted, ${inserted} saved, ${updated} updated, ${skipped} skipped`);

  if (publish && (inserted > 0 || updated > 0)) {
    const { published, total } = await publishStories({
      categorySlug: category,
      minBodyLength: 600,
    });
    console.log(`   Published: ${published} of ${total} drafts in category "${category}"`);
  }

  console.log("\n📌 Next: Go to Admin → Management → Publish drafts, or deploy and submit sitemap to Search Console.\n");
}

runSeoCrawl().catch((e) => {
  console.error(e);
  process.exit(1);
});
