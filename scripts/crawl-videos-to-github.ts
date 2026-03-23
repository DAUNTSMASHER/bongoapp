/**
 * Crawl BCK videos and save to GitHub. Run: npx tsx scripts/crawl-videos-to-github.ts
 * Requires: GITHUB_TOKEN, GITHUB_REPO in .env.local
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback to .env
import { crawlBanglaChotiListing } from "./crawler/crawlBanglaChotiVideos";
import { saveCrawledVideosToGitHub } from "./crawler/saveCrawledVideosToGitHub";

const BCK_URLS = [
  "https://www.banglachotikahinii.com/videos/latest-updates/",
  "https://www.banglachotikahinii.com/videos/most-popular/",
  "https://www.banglachotikahinii.com/videos/top-rated/",
  "https://www.banglachotikahinii.com/videos/",
];

async function main() {
  if (!process.env.GITHUB_TOKEN?.trim() || !process.env.GITHUB_REPO?.trim()) {
    console.error("Set GITHUB_TOKEN and GITHUB_REPO in .env.local");
    process.exit(1);
  }

  const maxPerUrl = parseInt(process.argv[2] || "50", 10);
  const allVideos: Awaited<ReturnType<typeof crawlBanglaChotiListing>> = [];
  const seen = new Set<string>();

  for (let i = 0; i < BCK_URLS.length; i++) {
    const url = BCK_URLS[i];
    console.log(`\n[${i + 1}/${BCK_URLS.length}] Crawling ${url.slice(0, 55)}...`);
    try {
      const videos = await crawlBanglaChotiListing(url, {
        maxVideos: maxPerUrl,
        usePuppeteer: true,
        onProgress: (cur, tot, msg) => console.log(`  ${cur}/${tot} ${msg.slice(0, 50)}`),
      });
      for (const v of videos) {
        if (v.id && !seen.has(v.id)) {
          seen.add(v.id);
          allVideos.push(v);
        }
      }
      console.log(`  → ${videos.length} videos, ${allVideos.length} total unique`);
    } catch (e) {
      console.error(`  Error:`, e);
    }
  }

  if (allVideos.length === 0) {
    console.log("\nNo videos to save.");
    return;
  }

  console.log(`\nSaving ${allVideos.length} videos to GitHub...`);
  const { saved, total } = await saveCrawledVideosToGitHub(allVideos, { merge: true });
  console.log(`Done. Saved ${saved} new, ${total} total in repo.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
