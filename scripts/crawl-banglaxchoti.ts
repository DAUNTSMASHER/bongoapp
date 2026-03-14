/**
 * Crawl stories from banglaxchotikahini.com
 * Usage: npx tsx scripts/crawl-banglaxchoti.ts [startUrl]
 *
 * 1. Extracts story from given URL
 * 2. Fetches homepage/listing to find more story links
 * 3. Crawls minimum 5 stories
 * 4. Saves to Firestore with cover images and random categories
 * 5. Publishes
 */

import * as cheerio from "cheerio";
import {
  crawlStoriesFromUrls,
  extractStoryLinksFromListing,
  type EnrichedCrawledStory,
} from "./crawler/crawlBanglaChotiSmart";
import { saveSmartStoriesToFirestore, publishStories } from "./crawler/saveStoriesToFirestore";
import {
  fetchHtmlWithFallback,
  type FetchProvider,
} from "@/lib/fetchHtmlProviders";
import { CATEGORIES } from "@/lib/stories";

/** Fallback: extract any story-like links (Related Posts, sidebar, etc.) */
function extractMoreStoryLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const seen = new Set<string>();
  const out: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    if (/^\/(category|author|tag|page|feed|search)\//.test(href) || href.includes("/category/") || href.includes("/author/") || href.includes("/tag/") || href.includes("/page/")) return;
    try {
      const u = new URL(href, baseUrl);
      if (u.hostname !== base.hostname) return;
      const path = u.pathname.replace(/\/$/, "");
      const segs = path.split("/").filter(Boolean);
      if (segs.length < 2) return;
      const abs = u.href;
      if (seen.has(abs)) return;
      seen.add(abs);
      out.push(abs);
    } catch {
      /* skip */
    }
  });
  return out;
}

const START_URL =
  process.argv[2] || "https://banglaxchotikahini.com/chachi-ar-chachir-meye-ke-chodar-koyekti-choti-golpo/";
const MIN_STORIES = 5;

function pickRandomCategory(): string {
  const slugs = CATEGORIES.map((c) => c.slug).filter((s) => s !== "uncategorized");
  return slugs[Math.floor(Math.random() * slugs.length)] || "sera";
}

async function collectStoryUrls(startUrl: string): Promise<string[]> {
  const base = new URL(startUrl);
  const seen = new Set<string>();
  const normalizedStart = startUrl.replace(/\/$/, "");
  const urls: string[] = [normalizedStart];
  seen.add(normalizedStart);

  const queue: string[] = [startUrl, `${base.origin}/`];
  const done = new Set<string>();

  while (queue.length > 0 && urls.length < 20) {
    const url = queue.shift()!;
    const norm = url.replace(/\/$/, "");
    if (done.has(norm)) continue;
    done.add(norm);
    try {
      console.log("Fetching links from:", url.slice(0, 60) + "...");
      const preferred: FetchProvider[] = ["fetch", "playwright", "firecrawl", "browsercat", "puppeteer"];
      const { html } = await fetchHtmlWithFallback(url, preferred);
      const $ = cheerio.load(html);
      const links = extractStoryLinksFromListing(html, url);
      for (const { url: u } of links) {
        const normalized = u.replace(/\/$/, "");
        if (!seen.has(normalized) && u.includes(base.hostname) && !u.includes("/author/") && !u.includes("/page/")) {
          seen.add(normalized);
          urls.push(normalized);
        }
      }
      if (links.length < 3) {
        for (const u of extractMoreStoryLinks(html, url)) {
          const normalized = u.replace(/\/$/, "");
          if (!seen.has(normalized)) {
            seen.add(normalized);
            urls.push(normalized);
          }
        }
      }
      $('a[href*="/category/"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes(base.hostname)) {
          const catUrl = new URL(href, base.origin).href.replace(/\/$/, "");
          if (!done.has(catUrl) && !queue.includes(catUrl) && queue.length < 4) {
            queue.push(catUrl);
          }
        }
      });
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.warn("  Failed:", String(e).slice(0, 50));
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
  return [...byPath.values()].slice(0, 20);
}

async function main() {
  console.log("Crawling banglaxchotikahini.com");
  console.log("Start URL:", START_URL);
  console.log("Min stories:", MIN_STORIES);

  const urls = await collectStoryUrls(START_URL);
  console.log("\nCollected", urls.length, "story URLs");
  if (urls.length === 0) {
    console.error("No story URLs found.");
    process.exit(1);
  }

  const stories = await crawlStoriesFromUrls(urls, "sera", {
    usePlaywright: !process.env.VERCEL,
    useFirecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
    qualityFilter: { minBodyLength: 600, minParagraphs: 1, rejectCtaEnding: false },
    onProgress: (done, total, msg) => console.log(`  ${msg}`),
    preferredProviders: ["fetch", "playwright", "firecrawl", "browsercat", "puppeteer"],
  });

  if (stories.length < MIN_STORIES) {
    console.warn(`Only ${stories.length} stories extracted (wanted ${MIN_STORIES}). Proceeding.`);
  }

  const withRandomCategory: EnrichedCrawledStory[] = stories.map((s) => ({
    ...s,
    categorySlug: pickRandomCategory(),
  }));

  console.log("\nSaving to Firestore with cover images...");
  const { inserted, skipped } = await saveSmartStoriesToFirestore(withRandomCategory, "sera", {
    createVariantsOnDuplicate: true,
    assignCoverImages: true,
  });
  console.log(`Inserted: ${inserted}, Skipped: ${skipped}`);

  if (inserted > 0) {
    console.log("\nPublishing...");
    const { published, skippedShort } = await publishStories({ minBodyLength: 800 });
    console.log(`Published: ${published} story/stories.${skippedShort ? ` (${skippedShort} skipped: too short)` : ""}`);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
