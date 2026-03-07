/**
 * Test if embedUrl plays video when loaded (e.g. in iframe).
 * Run: npx tsx scripts/check-embed-url.ts
 * Uses Puppeteer to load embed URL and check for working player.
 */

import { initFirestore } from "./crawler/saveToFirestore";

async function main() {
  console.log("Testing embedUrl (iframe-style) with Puppeteer...\n");

  const firestore = initFirestore();
  const snap = await firestore
    .collection("videos")
    .where("status", "==", "active")
    .limit(20)
    .get();

  const withEmbed = snap.docs.filter((d) => d.data().embedUrl);
  if (withEmbed.length === 0) {
    console.log("No videos with embedUrl found.");
    process.exit(0);
    return;
  }

  console.log(`Found ${withEmbed.length} video(s) with embedUrl. Testing first 5...\n`);

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ headless: true });

  const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  let works = 0;
  let fails = 0;

  for (let i = 0; i < Math.min(5, withEmbed.length); i++) {
    const doc = withEmbed[i];
    const d = doc.data();
    const embedUrl = d.embedUrl as string;
    const title = (d.title || "Video").slice(0, 45);

    try {
      const page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);
      await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

      const res = await page.goto(embedUrl, {
        waitUntil: "networkidle0",
        timeout: 15000,
      });

      const status = res?.status() ?? 0;

      if (status !== 200) {
        console.log(`[${i + 1}] ${title}...`);
        console.log(`     ✗ HTTP ${status}`);
        fails++;
        await page.close();
        continue;
      }

      // Wait a bit for JS to render player
      await new Promise((r) => setTimeout(r, 2000));

      const html = await page.content();

      // Check for error messages
      const hasError =
        /media play link is not found|video not found|404|not available|removed|deleted/i.test(html);

      // Check for video player elements
      const hasVideo = await page.evaluate(() => {
        const v = document.querySelector("video");
        if (v?.src || v?.querySelector("source[src]")) return true;
        const iframe = document.querySelector("iframe[src]");
        if (iframe) return true;
        const embed = document.querySelector("embed[src]");
        if (embed) return true;
        return !!document.querySelector("[class*='player' i], [id*='player' i]");
      });

      const hasMp4OrSource = /\.mp4|source.*src|video.*src|get_file/i.test(html);

      await page.close();

      const likelyWorks = hasVideo && hasMp4OrSource && !hasError;

      console.log(`[${i + 1}] ${title}...`);
      console.log(`     embedUrl: ${embedUrl.slice(0, 55)}...`);
      if (hasError) {
        console.log(`     ✗ Shows error message (media play link not found etc)`);
        fails++;
      } else if (likelyWorks) {
        console.log(`     ✓ Has player + video source — embed likely works`);
        works++;
      } else if (hasVideo) {
        console.log(`     ? Has player markup, unclear if video loads`);
      } else {
        console.log(`     ✗ No video player found`);
        fails++;
      }
      console.log("");
      // Delay between requests to reduce 403 from rate limiting
      if (i < Math.min(5, withEmbed.length) - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (e) {
      console.log(`[${i + 1}] ${title}...`);
      console.log(`     ✗ ${e instanceof Error ? e.message : String(e)}`);
      fails++;
    }
  }

  await browser.close();

  console.log("──────────────────────────────────────────────────────────");
  console.log(`SUMMARY: ${works} likely work, ${fails} fail/unclear (of ${Math.min(5, withEmbed.length)} tested)`);
  console.log("──────────────────────────────────────────────────────────");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
