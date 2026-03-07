/**
 * Crawl video links and optionally save to Firestore.
 *
 * Run:
 *   npx tsx scripts/crawler/index.ts [url]
 *   npx tsx scripts/crawler/index.ts [url] --save
 *   npx tsx scripts/crawler/index.ts "https://www.banglachotikahinii.com/videos/" --banglachoti --save
 *
 * --banglachoti: use BanglaChotiKahinii crawler (extracts direct .mp4, embed, metadata)
 * --save: write results to Firestore
 */

import { crawlVideoLinks } from "./crawlVideoLinks";
import { saveVideoLinksToFirestore } from "./saveToFirestore";
import { crawlBanglaChotiListing } from "./crawlBanglaChotiVideos";
import { saveCrawledVideosToFirestore } from "./saveCrawledVideos";

async function main() {
  const args = process.argv.slice(2).filter(
    (a) => a !== "--save" && a !== "--banglachoti"
  );
  const pageUrl = args[0] || "https://example.com/";
  const saveToDb = process.argv.includes("--save");
  const banglaChoti = process.argv.includes("--banglachoti");

  if (banglaChoti) {
    console.log(`Crawling BanglaChotiKahinii: ${pageUrl}`);
    const videos = await crawlBanglaChotiListing(pageUrl, { maxVideos: 20 });
    console.log(`Found ${videos.length} video(s):\n`);
    videos.forEach((v, i) => {
      console.log(`${i + 1}. ${v.title}`);
      console.log(`   id: ${v.id}`);
      if (v.directVideoUrl) console.log(`   direct: ${v.directVideoUrl}`);
      if (v.embedUrl) console.log(`   embed: ${v.embedUrl}`);
    });
    if (saveToDb && videos.length > 0) {
      console.log("\nSaving to Firestore...");
      const { inserted, skipped } = await saveCrawledVideosToFirestore(videos);
      console.log(`Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
    }
    return;
  }

  console.log(`Crawling: ${pageUrl}`);
  const links = await crawlVideoLinks(pageUrl);
  console.log(`Found ${links.length} video link(s):\n`);
  links.forEach((l, i) => {
    console.log(`${i + 1}. [${l.type}] ${l.src}`);
    if (l.text) console.log(`   text: "${l.text}"`);
  });
  if (saveToDb && links.length > 0) {
    console.log("\nSaving to Firestore...");
    const { inserted, skipped } = await saveVideoLinksToFirestore(links);
    console.log(`Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
  }
}

main().catch(console.error);
