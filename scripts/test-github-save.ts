/**
 * Quick test: save a few videos to GitHub. Run: npx tsx scripts/test-github-save.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { crawlBanglaChotiListing } from "./crawler/crawlBanglaChotiVideos";
import { saveCrawledVideosToGitHub } from "./crawler/saveCrawledVideosToGitHub";

async function main() {
  console.log("Crawling 5 videos from latest...");
  const videos = await crawlBanglaChotiListing(
    "https://www.banglachotikahinii.com/videos/latest-updates/",
    { maxVideos: 5, usePuppeteer: true }
  );
  console.log(`Got ${videos.length} videos. Saving to GitHub...`);
  const { saved, total } = await saveCrawledVideosToGitHub(videos, { merge: true });
  console.log(`Done. Saved ${saved}, total ${total}`);
}

main().catch(console.error);
