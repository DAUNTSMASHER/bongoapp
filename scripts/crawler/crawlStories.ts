/**
 * Story crawler – fetches a listing page, extracts story links,
 * visits each page and extracts full story text. For use with Bangla story sites.
 */

import * as cheerio from "cheerio";

export interface CrawledStory {
  title: string;
  body: string;
  summary: string;
  sourceUrl: string;
}

/** Common content selectors – try in order. Extend as needed. */
const CONTENT_SELECTORS = [
  "article",
  ".post-content",
  ".entry-content",
  ".story-content",
  ".article-content",
  ".content",
  "main",
  "[role='article']",
  ".story-body",
  ".post-body",
  "#content",
  ".page-content",
];

async function fetchHtml(pageUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  const res = await fetch(pageUrl, {
    signal: controller.signal,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; StoryCrawler/1.0; +https://example.com)",
    },
    redirect: "follow",
  });
  clearTimeout(timeout);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${pageUrl}`);
  return res.text();
}

function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Returns true if the link looks like a story page (same domain, not nav/static).
 */
function isStoryLink(href: string, baseUrl: string): boolean {
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return false;
  try {
    const base = new URL(baseUrl);
    const u = new URL(href, baseUrl);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (u.hostname !== base.hostname) return false;
    const path = u.pathname.toLowerCase();
    if (path.endsWith(".pdf") || path.endsWith(".jpg") || path.endsWith(".png")) return false;
    if (path.includes("/tag/") || path.includes("/category/") || path.includes("/author/")) return false;
    if (path === "/" || path === base.pathname) return false;
    return path.length > 3;
  } catch {
    return false;
  }
}

/**
 * Extracts story links from a listing/category page.
 */
function extractStoryLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const absolute = resolveUrl(baseUrl, href);
    if (!isStoryLink(absolute, baseUrl)) return;
    if (seen.has(absolute)) return;
    seen.add(absolute);
    links.push(absolute);
  });
  return links;
}

/**
 * Extracts title and body from a story page.
 */
function extractStoryContent(html: string, pageUrl: string): CrawledStory | null {
  const $ = cheerio.load(html);
  const title =
    $("h1").first().text().trim() ||
    $("title").text().split(/[|-]/)[0].trim() ||
    "Untitled";
  let body = "";
  for (const sel of CONTENT_SELECTORS) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.text().trim().replace(/\s+/g, " ").trim();
      if (text.length > 100) {
        body = text;
        break;
      }
    }
  }
  if (!body) {
    const main = $("main, #main, .main, #story, .story").first();
    if (main.length) body = main.text().trim().replace(/\s+/g, " ").trim();
  }
  if (!body) body = $("p").map((_, p) => $(p).text()).get().join("\n\n").trim();
  if (!body || body.length < 50) return null;
  const summary = body.slice(0, 150).trim() + (body.length > 150 ? "…" : "");
  return { title, body, summary, sourceUrl: pageUrl };
}

/**
 * Crawls listing URL, fetches up to maxCount stories, extracts full text.
 */
export async function crawlStories(
  listingUrl: string,
  maxCount: number
): Promise<CrawledStory[]> {
  const html = await fetchHtml(listingUrl);
  const links = extractStoryLinks(html, listingUrl);
  const stories: CrawledStory[] = [];
  for (let i = 0; i < Math.min(links.length, maxCount); i++) {
    try {
      const storyHtml = await fetchHtml(links[i]);
      const story = extractStoryContent(storyHtml, links[i]);
      if (story) stories.push(story);
    } catch {
      // skip failed pages
    }
  }
  return stories;
}
