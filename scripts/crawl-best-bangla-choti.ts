/**
 * Crawl best Bangla choti stories and upload to Firestore.
 *
 * Collects unique, quality stories from Bangla choti sites:
 * - banglachotikahinii.com
 * - banglaxchotikahini.com
 *
 * Uses smart crawler: ML processing, deduplication (storyId), quality filter.
 * Saves as draft with cover images. Optionally publishes.
 *
 * Usage:
 *   npm run crawl:best
 *   npm run crawl:best -- https://www.banglachotikahinii.com/
 *   npm run crawl:best -- https://banglaxchotikahini.com/ sera 30 --publish
 *
 * Args: [startUrl] [categorySlug] [count] [--publish]
 */

import * as cheerio from "cheerio";
import {
  crawlBanglaChotiSmart,
  crawlStoriesFromUrls,
  extractStoryLinksFromListing,
  type EnrichedCrawledStory,
} from "./crawler/crawlBanglaChotiSmart";
import { saveSmartStoriesToFirestore, publishStories } from "./crawler/saveStoriesToFirestore";
import { fetchHtmlWithFallback, type FetchProvider } from "@/lib/fetchHtmlProviders";
import { CATEGORIES } from "@/lib/stories";

const DEFAULT_URL = "https://www.banglachotikahinii.com/";
const DEFAULT_CATEGORY = "sera";
const DEFAULT_COUNT = 20;

function pickRandomCategory(): string {
  const slugs = CATEGORIES.map((c) => c.slug).filter((s) => s !== "uncategorized");
  return slugs[Math.floor(Math.random() * slugs.length)] || "sera";
}

/** Collect story URLs from a start URL and related category pages */
async function collectStoryUrls(
  startUrl: string,
  maxUrls: number,
  onProgress?: (msg: string) => void
): Promise<string[]> {
  const base = new URL(startUrl);
  const seen = new Set<string>();
  const urls: string[] = [];
  const queue: string[] = [startUrl, `${base.origin}/`];
  const done = new Set<string>();
  const preferred: FetchProvider[] = ["fetch", "playwright", "firecrawl", "browsercat", "puppeteer"];

  while (queue.length > 0 && urls.length < maxUrls) {
    const url = queue.shift()!;
    const norm = url.replace(/\/$/, "");
    if (done.has(norm)) continue;
    done.add(norm);

    try {
      onProgress?.(`Fetching: ${url.slice(0, 55)}...`);
      const { html } = await fetchHtmlWithFallback(url, preferred);
      const links = extractStoryLinksFromListing(html, url);

      for (const { url: u } of links) {
        const normalized = u.replace(/\/$/, "");
        if (
          !seen.has(normalized) &&
          u.includes(base.hostname) &&
          !u.includes("/author/") &&
          !u.match(/\/page\/\d+/)
        ) {
          seen.add(normalized);
          urls.push(normalized);
          if (urls.length >= maxUrls) break;
        }
      }

      if (urls.length < maxUrls) {
        const $ = cheerio.load(html);
        $('a[href*="/category/"]').each((_, el) => {
          const href = $(el).attr("href");
          if (href && href.includes(base.hostname)) {
            try {
              const catUrl = new URL(href, base.origin).href.replace(/\/$/, "");
              if (!done.has(catUrl) && !queue.includes(catUrl) && queue.length < 6) {
                queue.push(catUrl);
              }
            } catch {
              /* skip */
            }
          }
        });
      }

      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      onProgress?.(`  Failed: ${String(e).slice(0, 50)}`);
    }
  }

  const byPath = new Map<string, string>();
  for (const u of urls) {
    try {
      const parsed = new URL(u);
      const key = parsed.origin + parsed.pathname.replace(/\/$/, "");
      if (!byPath.has(key)) byPath.set(key, u);
    } catch {
      /* skip */
    }
  }
  return [...byPath.values()].slice(0, maxUrls);
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const doPublish = rawArgs.includes("--publish");
  const args = rawArgs.filter((a) => a !== "--publish");

  const startUrl = args[0] || process.env.CRAWL_STORY_URL || DEFAULT_URL;
  const categorySlug = args[1] || process.env.CRAWL_STORY_CATEGORY || DEFAULT_CATEGORY;
  const count = Math.min(
    Math.max(parseInt(args[2] || String(DEFAULT_COUNT), 10) || DEFAULT_COUNT, 1),
    100
  );

  const isVercel = Boolean(process.env.VERCEL);
  const useFirecrawl = Boolean(process.env.FIRECRAWL_API_KEY) || isVercel;
  const preferredProviders: FetchProvider[] = [
    "fetch",
    "playwright",
    "firecrawl",
    "browsercat",
    "puppeteer",
  ];

  console.log("Crawl best Bangla choti → Firestore");
  console.log("  Source:", startUrl);
  console.log("  Category:", categorySlug);
  console.log("  Target:", count, "unique stories");
  console.log("  Publish:", doPublish);
  console.log("");

  // Strategy: use smart crawl if URL is a listing; else collect URLs then crawl
  const looksLikeListing =
    startUrl.endsWith("/") ||
    startUrl.includes("/category/") ||
    startUrl.includes("/page/");

  let stories: EnrichedCrawledStory[];

  if (looksLikeListing) {
    console.log("Using smart crawler (listing → categories → stories)...");
    stories = await crawlBanglaChotiSmart(startUrl, count, categorySlug, {
      useFirecrawl,
      usePlaywright: !isVercel,
      qualityFilter: { minBodyLength: 800, minParagraphs: 1, rejectCtaEnding: true },
      onProgress: (cur, tgt, msg) => console.log(`  [${cur}/${tgt}] ${msg}`),
    });
  } else {
    console.log("Collecting story URLs...");
    const urls = await collectStoryUrls(startUrl, count + 10, (msg) => console.log("  ", msg));
    console.log("  Found", urls.length, "story URLs");
    if (urls.length === 0) {
      console.error("No story URLs found. Try a listing URL (e.g. homepage or category).");
      process.exit(1);
    }
    console.log("Crawling story pages...");
    stories = await crawlStoriesFromUrls(urls, categorySlug, {
      useFirecrawl,
      usePlaywright: !isVercel,
      preferredProviders,
      qualityFilter: { minBodyLength: 800, minParagraphs: 1, rejectCtaEnding: true },
      onProgress: (done, total, msg) => console.log(`  [${done}/${total}] ${msg}`),
    });
  }

  if (stories.length === 0) {
    console.log("No stories extracted. Site may block bots; try FIRECRAWL_API_KEY or run locally.");
    process.exit(1);
  }

  const withRandomCategory: EnrichedCrawledStory[] = stories.map((s) => ({
    ...s,
    categorySlug: pickRandomCategory(),
  }));

  console.log("\nSaving to Firestore (draft, with cover images)...");
  const { inserted, skipped } = await saveSmartStoriesToFirestore(withRandomCategory, categorySlug, {
    createVariantsOnDuplicate: true,
    assignCoverImages: true,
  });
  console.log(`  Inserted: ${inserted}, Skipped: ${skipped} (duplicates)`);

  if (doPublish && inserted > 0) {
    console.log("\nPublishing...");
    const { published, skippedShort } = await publishStories({ minBodyLength: 800 });
    console.log(`  Published: ${published}${skippedShort ? ` (${skippedShort} skipped: too short)` : ""}`);
  } else if (!doPublish) {
    console.log("\nStories saved as draft. Use admin Publish or run with --publish to make live.");
  }

  console.log("\nDone.");
}

main().catch((e) => {
  const err = e as { code?: number };
  if (String(e).includes("5 NOT_FOUND") || err?.code === 5) {
    console.error("\nFirestore NOT_FOUND. Create Firestore DB in Firebase Console.");
  } else {
    console.error(e);
  }
  process.exit(1);
});
