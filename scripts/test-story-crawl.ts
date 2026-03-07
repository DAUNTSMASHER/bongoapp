/**
 * Test: can we fetch BanglaChotiKahinii stories from the web?
 */
import * as cheerio from "cheerio";

const LISTING = "https://www.banglachotikahinii.com/";
const STORY_SAMPLE = "https://www.banglachotikahinii.com/bangla-incest-choti/modhur-swad-tokmisti-4/";

async function main() {
  console.log("1. Fetching listing:", LISTING);
  const listRes = await fetch(LISTING, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });
  console.log("   Status:", listRes.status);
  const listHtml = await listRes.text();
  console.log("   HTML length:", listHtml.length);

  const $ = cheerio.load(listHtml);
  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    try {
      const u = new URL(href, LISTING);
      if (u.hostname !== "www.banglachotikahinii.com") return;
      const p = u.pathname.toLowerCase();
      if (
        p.includes("/videos/") ||
        p.includes("/category/") ||
        p.includes("/tag/") ||
        p === "/" ||
        p.length < 5
      )
        return;
      links.push(u.href);
    } catch {}
  });
  const unique = [...new Set(links)];
  console.log("2. Story-like links found:", unique.length);
  console.log("   Samples:", unique.slice(0, 5));

  console.log("\n3. Fetching one story (with Puppeteer):", STORY_SAMPLE);
  const { default: puppeteer } = await import("puppeteer");
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36"
  );
  const res = await page.goto(STORY_SAMPLE, { waitUntil: "domcontentloaded", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 2000));
  const storyHtml = await page.content();
  await browser.close();
  console.log("   Status:", res?.status());
  console.log("   HTML length:", storyHtml.length);

  const $2 = cheerio.load(storyHtml);
  const title = $2("h1").first().text().trim() || $2("title").text().split(/[|-]/)[0].trim();
  console.log("   Title:", title.slice(0, 60));
  const contentSelectors = [
    "article",
    ".post-content",
    ".entry-content",
    ".story-content",
    ".content",
    "main",
  ];
  let body = "";
  for (const sel of contentSelectors) {
    const el = $2(sel).first();
    if (el.length) {
      const text = el.text().trim().replace(/\s+/g, " ").trim();
      if (text.length > 100) {
        body = text;
        break;
      }
    }
  }
  if (!body) body = $2("p").map((_, p) => $2(p).text()).get().join("\n\n").trim();
  console.log("   Body length:", body.length);
  console.log("   Body preview:", body.slice(0, 150) + "...");

  console.log("\n--- Result: Crawl", body.length > 50 ? "WORKS" : "FAILED (no content)");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
