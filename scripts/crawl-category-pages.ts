/**
 * Crawl stories from specific category listing pages and save to Firestore.
 * Run: npx tsx scripts/crawl-category-pages.ts [baseUrl] [pageStart] [pageEnd] [categorySlug]
 *
 * Example (pages 130-134 of bangla-housewife-sex-story):
 *   npx tsx scripts/crawl-category-pages.ts "https://www.banglachotikahinii.com/category/bangla-housewife-sex-story" 130 134 grihobodhur
 */
import "dotenv/config";
import { crawlStoriesFromListingPages } from "./crawler/crawlBanglaChotiSmart";
import { saveSmartStoriesToFirestore, publishStories } from "./crawler/saveStoriesToFirestore";

const BASE =
  process.argv[2] || "https://www.banglachotikahinii.com/category/bangla-housewife-sex-story";
const PAGE_START = parseInt(process.argv[3] || "130", 10);
const PAGE_END = parseInt(process.argv[4] || "134", 10);
const CATEGORY = process.argv[5] || "grihobodhur";

function buildListingUrls(base: string, start: number, end: number): string[] {
  const urls: string[] = [];
  const b = base.replace(/\/+$/, "");
  for (let p = start; p <= end; p++) {
    urls.push(`${b}/page/${p}/`);
  }
  return urls;
}

async function main() {
  const urls = buildListingUrls(BASE, PAGE_START, PAGE_END);
  console.log("═".repeat(60));
  console.log("CRAWL CATEGORY PAGES → SAVE TO FIRESTORE");
  console.log("═".repeat(60));
  console.log("Base URL:", BASE);
  console.log("Pages:", PAGE_START, "to", PAGE_END, "→", urls.length, "listing pages");
  console.log("Category:", CATEGORY);
  console.log("Provider: Playwright first (Firecrawl skipped)");
  console.log("");

  const stories = await crawlStoriesFromListingPages(urls, CATEGORY, {
    useFirecrawl: false,
    usePlaywright: true,
    qualityFilter: { minBodyLength: 500, minParagraphs: 1, rejectCtaEnding: false },
    onProgress: (msg) => console.log(" ", msg),
  });

  if (stories.length === 0) {
    console.log("\nNo stories extracted.");
    process.exit(1);
  }

  console.log("\nSaving to Firestore (createVariantsOnDuplicate: true)...");
  const { inserted, skipped } = await saveSmartStoriesToFirestore(stories, CATEGORY, {
    createVariantsOnDuplicate: true,
  });
  console.log(`Saved: ${inserted} inserted, ${skipped} skipped (duplicates)`);

  if (inserted > 0) {
    console.log("Publishing...");
    const { published, total, skippedShort } = await publishStories({ categorySlug: CATEGORY });
    console.log(`Published: ${published} / ${total} (${skippedShort} skipped – too short)`);
  }

  console.log("\n✓ Done. Extracted:", stories.length, "| Saved:", inserted);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
