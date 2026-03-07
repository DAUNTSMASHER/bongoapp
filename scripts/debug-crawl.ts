/**
 * Debug BanglaChoti crawl - log listing items and first detail page.
 * Run: npx tsx scripts/debug-crawl.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

import * as cheerio from "cheerio";

const LISTING = "https://www.banglachotikahinii.com/videos/";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function resolveUrl(baseUrl: string, href: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

async function main() {
  console.log("Fetching listing with Puppeteer...");
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  const res = await page.goto(LISTING, { waitUntil: "networkidle2", timeout: 30000 });
  const status = res?.status();
  console.log("Status:", status);
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  const items: Array<{ url: string; title: string }> = [];
  const seen = new Set<string>();

  $('a[href*="/videos/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const full = resolveUrl(LISTING, href);
    if (
      full.includes("/videos/tags/") ||
      full.includes("/videos/categories/") ||
      full.endsWith("/videos/") ||
      full === LISTING
    )
      return;
    if (seen.has(full)) return;
    seen.add(full);
    const title =
      $(el).find("img").attr("alt") ||
      $(el).attr("title") ||
      $(el).text().trim().replace(/\s+/g, " ").slice(0, 80) ||
      "Video";
    items.push({ url: full, title });
  });

  console.log(`Found ${items.length} links from a[href*="/videos/"]`);
  items.slice(0, 5).forEach((i, idx) => console.log(`  ${idx + 1}. ${i.title} | ${i.url}`));

  // Count other possible selectors
  const allVidLinks = $('a[href*="video"]').length;
  console.log(`\na[href*="video"] count: ${allVidLinks}`);

  // Fetch first actual video detail page
  const firstVideo = items.find((i) => !i.url.includes("top-rated") && !i.url.includes("latest-updates") && !i.url.includes("most-popular"));
  if (firstVideo) {
    console.log(`\nFetching detail: ${firstVideo.url}`);
    const p2 = await puppeteer.default.launch({ headless: true });
    const page2 = await p2.newPage();
    await page2.setUserAgent(USER_AGENT);
    await page2.goto(firstVideo.url, { waitUntil: "networkidle2", timeout: 20000 });
    const detailHtml = await page2.content();
    await p2.close();

    const direct = detailHtml.match(/https?:\/\/[^\s"'<>]+\.(mp4|webm|m3u8)[^\s"'<>]*/i);
    const iframe = detailHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    const getFile = detailHtml.match(/\/videos\/get_file\/[^"'\s<>]+\.mp4/);
    console.log("Direct .mp4/.webm/.m3u8:", direct ? direct[0].slice(0, 80) + "..." : "none");
    console.log("Iframe src:", iframe ? iframe[1].slice(0, 80) + "..." : "none");
    console.log("get_file pattern:", getFile ? "found" : "none");
  }
}

main().catch(console.error);
