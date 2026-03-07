/**
 * Test crawl - debug step by step.
 * Run: npx tsx scripts/test-crawl-one.ts
 */

import * as cheerio from "cheerio";
import * as puppeteer from "puppeteer";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function resolveUrl(base: string, href: string): string {
  return new URL(href, base).href;
}

async function main() {
  const listingUrl = "https://www.banglachotikahinii.com/videos/latest-updates/";
  console.log("1. Fetching listing...");
  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.goto(listingUrl, { waitUntil: "networkidle2", timeout: 25000 });
  const html = await page.content();

  const $ = cheerio.load(html);
  const items: { url: string; title: string }[] = [];
  const seen = new Set<string>();
  $('a[href*="/videos/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const full = resolveUrl(listingUrl, href);
    if (
      full.includes("/videos/tags/") ||
      full.includes("/videos/categories/") ||
      full.endsWith("/videos/") ||
      full.includes("/videos/top-rated") ||
      full.includes("/videos/latest-updates") ||
      full.includes("/videos/most-popular")
    )
      return;
    if (seen.has(full)) return;
    seen.add(full);
    items.push({
      url: full,
      title: $(el).find("img").attr("alt") || $(el).text().trim().slice(0, 50) || "Video",
    });
  });
  console.log("2. Parsed", items.length, "video links");
  if (items[0]) console.log("   First:", items[0].url);

  if (items.length > 0) {
    const detailUrl = items[0].url;
    console.log("3. Fetching detail page...");
    await page.goto(detailUrl, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 3000)); // wait for JS
    const detailHtml = await page.content();
    const getFile = detailHtml.match(/\/videos\/get_file\/[^"'\s<>]+\.mp4/);
    const iframe = detailHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    console.log("   get_file:", getFile ? "FOUND" : "none");
    console.log("   iframe:", iframe ? iframe[1].slice(0, 60) + "..." : "none");
    if (!getFile && !iframe) {
      console.log("   Trying FRESH browser -> bengali-college directly...");
      await browser.close();
      const b2 = await puppeteer.default.launch({ headless: true });
      const p2 = await b2.newPage();
      await p2.setUserAgent(UA);
      await p2.goto("https://www.banglachotikahinii.com/videos/bengali-college-meye-anal-chudai-sex-clip/", {
        waitUntil: "networkidle2",
        timeout: 20000,
      });
      await new Promise((r) => setTimeout(r, 2000));
      const html2 = await p2.content();
      const gf = html2.match(/\/videos\/get_file\/[^"'\s<>]+\.mp4/);
      const ifr = html2.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      console.log("   fresh bengali get_file:", gf ? "FOUND" : "none");
      console.log("   fresh bengali iframe:", ifr ? "FOUND" : "none");
      await b2.close();
      return;
    }
  }
  await browser.close();
  await browser.close();
}

main().catch(console.error);
