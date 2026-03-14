/**
 * Crawl videos from BanglaChotiKahinii URL and save to Firestore.
 * Run: npx tsx scripts/crawl-videos-from-url.ts [url] [maxVideos]
 * Example: npx tsx scripts/crawl-videos-from-url.ts "https://www.banglachotikahinii.com/videos/latest-updates/" 30
 */

import { crawlBanglaChotiListing } from "./crawler/crawlBanglaChotiVideos";
import { saveCrawledVideosToFirestore } from "./crawler/saveCrawledVideos";

const DEFAULT_URL = "https://www.banglachotikahinii.com/videos/latest-updates/";
const DEFAULT_MAX = 20;

async function main() {
  const url = process.argv[2] || DEFAULT_URL;
  const maxVideos = Math.min(
    Math.max(parseInt(process.argv[3] || String(DEFAULT_MAX), 10) || DEFAULT_MAX, 1),
    100
  );

  console.log("Crawling videos:", url);
  console.log("Max videos:", maxVideos);
  console.log("");

  const videos = await crawlBanglaChotiListing(url, {
    maxVideos,
    usePuppeteer: true,
  });

  console.log(`Found ${videos.length} video(s)`);
  videos.slice(0, 5).forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.title.slice(0, 50)}...`);
    if (v.embedUrl) console.log(`     embed: ${v.embedUrl.slice(0, 60)}...`);
    if (v.directVideoUrl) console.log(`     direct: yes`);
  });
  if (videos.length > 5) console.log(`  ... and ${videos.length - 5} more`);

  if (videos.length === 0) {
    console.log("No videos extracted. Site may block bots.");
    process.exit(1);
  }

  const { inserted, skipped, updated } = await saveCrawledVideosToFirestore(videos, {
    forceUpsert: true,
  });
  console.log("");
  console.log(`Saved: ${inserted} new, ${updated} updated, ${skipped} skipped`);
  console.log("Videos are now visible at /videos");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
