/**
 * Story crawler – fetches a listing page, extracts story links,
 * visits each page and extracts full story text. For use with Bangla story sites.
 */

import * as cheerio from "cheerio";
import { extractStoryFromRawPageContent } from "@/lib/storyTextExtractor";

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

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function fetchWithPuppeteer(url: string): Promise<string> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.setJavaScriptEnabled(true);
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    if (!res || res.status() === 403) throw new Error("HTTP 403");
    if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
    await new Promise((r) => setTimeout(r, 1500));
    const html = await page.content();
    await page.close();
    return html;
  } finally {
    await browser.close();
  }
}

async function fetchHtml(pageUrl: string, usePuppeteer = false): Promise<string> {
  if (usePuppeteer) return fetchWithPuppeteer(pageUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.banglachotikahinii.com/",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (res.status === 403) throw new Error("HTTP 403");
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${pageUrl}`);
    return res.text();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
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
    if (
      path.includes("/tag/") ||
      path.includes("/author/") ||
      path.includes("/popular-stories") ||
      path.includes("/popular-authors") ||
      path.includes("/submit-story") ||
      path.includes("/contact-us") ||
      path.includes("/videos/")
    )
      return false;
    // Exclude category index (e.g. /category/foo/) but allow story links (e.g. /category/foo/story-slug/)
    if (path.includes("/category/")) {
      const segments = path.split("/").filter(Boolean);
      if (segments.length <= 2) return false; // /category/slug = index, not story
    }
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
 * Extracts body text from a single story page (no title - use first page for title).
 * Preserves paragraph breaks for cleaner extraction, then trims to story-only content.
 */
function extractBodyFromPage(html: string): string {
  const $ = cheerio.load(html);
  let body = "";

  for (const sel of CONTENT_SELECTORS) {
    const el = $(sel).first();
    if (el.length) {
      // Exclude common non-story elements (categories, tags, similar stories, nav)
      const clone = el.clone();
      clone.find(".entry-footer, .post-footer, .entry-meta, .post-meta, .categories, .tags, .related-posts, .similar-stories, .nav-links, .page-links, .widget, aside, [class*='sidebar']").remove();
      const paras = clone.find("p").length;
      const text = paras > 2
        ? clone.find("p").map((_, p) => $(p).text().trim()).get().filter(Boolean).join("\n\n")
        : clone.text().trim().replace(/\n{3,}/g, "\n\n").replace(/\s+/g, " ");
      if (text.length > 100) {
        body = text;
        break;
      }
    }
  }

  if (!body) {
    const main = $("main, #main, .main, #story, .story").first();
    if (main.length) {
      main.find(".entry-footer, .categories, .tags, .related-posts").remove();
      body = main.find("p").length > 2
        ? main.find("p").map((_, p) => $(p).text().trim()).get().filter(Boolean).join("\n\n")
        : main.text().trim().replace(/\n{3,}/g, "\n\n").replace(/\s+/g, " ");
    }
  }
  if (!body) body = $("p").map((_, p) => $(p).text()).get().join("\n\n").trim();

  return extractStoryFromRawPageContent(body || "");
}

/**
 * Extracts title and body from a story page (single page).
 */
function extractStoryContent(html: string, pageUrl: string): CrawledStory | null {
  const $ = cheerio.load(html);
  const title =
    $("h1").first().text().trim() ||
    $("title").text().split(/[|-]/)[0].trim() ||
    "Untitled";
  const body = extractBodyFromPage(html);
  if (!body || body.length < 50) return null;
  const summary = body.slice(0, 150).trim() + (body.length > 150 ? "…" : "");
  return { title, body, summary, sourceUrl: pageUrl };
}

/** Max pages to follow per story (prevents infinite loops). */
const MAX_STORY_PAGES = 50;

/** Detect if href is a "next page" of the same story (WordPress /page/2/, etc.). */
function isNextPageOfStory(href: string, currentUrl: string): boolean {
  try {
    const base = new URL(currentUrl);
    const next = new URL(href, currentUrl);
    if (next.hostname !== base.hostname) return false;
    const basePath = base.pathname.replace(/\/page\/\d+\/?$/, "").replace(/\/$/, "") || "/";
    const nextPath = next.pathname.replace(/\/$/, "") || "/";
    if (!nextPath.startsWith(basePath) && !basePath.startsWith(nextPath)) return false;
    if (nextPath === basePath) return false;
    if (nextPath.includes("/page/") || /\d+$/.test(nextPath.split("/").pop() || "")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Extracts the "next page" link for multi-page stories.
 * Handles: WordPress <!--nextpage-->, rel="next", .page-links, /page/2/, etc.
 */
function extractNextPageLink(html: string, pageUrl: string): string | null {
  const $ = cheerio.load(html);
  const base = new URL(pageUrl);
  const basePathNoPage = base.pathname.replace(/\/page\/\d+\/?$/i, "").replace(/\/$/, "") || "/";
  const currentPageNum = parseInt(base.pathname.match(/\/page\/(\d+)/i)?.[1] || "1", 10);

  // 1. rel="next" – strong signal
  const relNext = $('a[rel="next"]').attr("href");
  if (relNext) {
    const abs = resolveUrl(pageUrl, relNext);
    if (isNextPageOfStory(abs, pageUrl)) return abs;
  }

  // 2. Any link to /page/(current+1)/ or /(current+1)/ for same story
  const escapedBase = basePathNoPage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nextPageRe = new RegExp(`^${escapedBase}/page/(\\d+)/?$`, "i");
  const altPageRe = new RegExp(`^${escapedBase}/(\\d+)/?$`, "i");

  let bestNext: string | null = null;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#")) return;
    const abs = resolveUrl(pageUrl, href);
    try {
      const u = new URL(abs);
      if (u.hostname !== base.hostname) return;
      let num = 0;
      const m1 = u.pathname.match(nextPageRe);
      const m2 = u.pathname.match(altPageRe);
      if (m1) num = parseInt(m1[1], 10);
      else if (m2) num = parseInt(m2[1], 10);
      if (num === currentPageNum + 1) {
        bestNext = abs;
        return false; // break
      }
    } catch {
      /* skip */
    }
  });

  if (bestNext) return bestNext;

  // 3. Fallback: construct /page/2/ or /2/ when on first page
  if (currentPageNum === 1) {
    const withSlash = basePathNoPage.endsWith("/") ? basePathNoPage : basePathNoPage + "/";
    return base.origin + withSlash + "page/2/";
  }

  return null;
}

/**
 * Fetches full story across all pages (Part 1, Part 2, ...).
 * Concatenates body from each page.
 */
async function extractFullStory(
  firstPageUrl: string,
  usePuppeteer: boolean,
  onProgress?: (msg: string) => void
): Promise<CrawledStory | null> {
  const fetchFn = (url: string) => fetchHtml(url, usePuppeteer);
  let html = await fetchFn(firstPageUrl);
  const firstContent = extractStoryContent(html, firstPageUrl);
  if (!firstContent) return null;

  const bodyParts: string[] = [firstContent.body];
  let currentUrl = firstPageUrl;
  let pageCount = 1;

  while (pageCount < MAX_STORY_PAGES) {
    const nextUrl = extractNextPageLink(html, currentUrl);
    if (!nextUrl || nextUrl === currentUrl) break;

    onProgress?.(`  → Page ${pageCount + 1}`);
    await new Promise((r) => setTimeout(r, usePuppeteer ? 600 : 250));
    try {
      html = await fetchFn(nextUrl);
    } catch {
      break;
    }
    const pageBody = extractBodyFromPage(html);
    if (pageBody.length < 50) break;
    bodyParts.push(pageBody);
    currentUrl = nextUrl;
    pageCount++;
  }

  const fullBody = bodyParts.join("\n\n");
  const summary = fullBody.slice(0, 150).trim() + (fullBody.length > 150 ? "…" : "");
  return {
    title: firstContent.title,
    body: fullBody,
    summary,
    sourceUrl: firstPageUrl,
  };
}

const BATCH_DELAY_MS = 500;

export type CrawlProgressCallback = (current: number, total: number, message?: string) => void;

const MIN_STORY_BODY_LENGTH = 200;

/**
 * Fetches a single story URL and extracts title + body.
 * Use for testing or one-off extraction.
 */
export async function extractStoryFromUrl(
  storyUrl: string,
  options?: { usePuppeteer?: boolean }
): Promise<CrawledStory | null> {
  const usePuppeteer = options?.usePuppeteer ?? false;
  return extractFullStory(storyUrl, usePuppeteer);
}

/**
 * Fetches URL, extracts story. If no story structure (body too short),
 * gets story links from page and tries first link, up to maxNavigateDepth times.
 */
export async function fetchAndExtractStory(
  url: string,
  options?: { usePuppeteer?: boolean; maxNavigateDepth?: number }
): Promise<CrawledStory | null> {
  let usePuppeteer = options?.usePuppeteer ?? false;
  const maxDepth = options?.maxNavigateDepth ?? 3;

  const fetchHtmlSafe = async (u: string): Promise<string> => {
    try {
      return await fetchHtml(u, usePuppeteer);
    } catch (e) {
      if (String(e).includes("403") && !usePuppeteer) {
        usePuppeteer = true;
        return fetchHtml(u, true);
      }
      throw e;
    }
  };

  let currentUrl = url;
  for (let depth = 0; depth < maxDepth; depth++) {
    try {
      const story = await extractFullStory(currentUrl, usePuppeteer);
      if (story && story.body.length >= MIN_STORY_BODY_LENGTH) {
        return story;
      }
    } catch (e) {
      if (String(e).includes("403") && !usePuppeteer) {
        usePuppeteer = true;
        depth--; // retry this iteration with Puppeteer
        continue;
      }
      throw e;
    }

    const html = await fetchHtmlSafe(currentUrl);
    const links = extractStoryLinks(html, currentUrl);
    if (links.length === 0) break;
    currentUrl = links[0];
    await new Promise((r) => setTimeout(r, usePuppeteer ? 600 : 300));
  }
  return null;
}

/**
 * Crawls listing URL, fetches up to maxCount stories, extracts full text.
 * Uses Puppeteer when site returns 403 (Cloudflare/bot protection).
 */
export async function crawlStories(
  listingUrl: string,
  maxCount: number,
  options?: {
    batchSize?: number;
    usePuppeteer?: boolean;
    onProgress?: CrawlProgressCallback;
  }
): Promise<CrawledStory[]> {
  const batchSize = Math.min(Math.max(options?.batchSize ?? 10, 1), 20);
  const onProgress = options?.onProgress;
  let usePuppeteer = options?.usePuppeteer ?? false;
  let html: string;

  onProgress?.(0, 0, "Fetching listing page...");
  try {
    html = await fetchHtml(listingUrl, usePuppeteer);
  } catch (e) {
    if (String(e).includes("403") && !usePuppeteer) {
      onProgress?.(0, 0, "Listing returned 403, retrying with Puppeteer...");
      usePuppeteer = true;
      html = await fetchHtml(listingUrl, true);
    } else throw e;
  }

  const links = extractStoryLinks(html, listingUrl);
  const limit = Math.min(links.length, maxCount);
  onProgress?.(0, limit, `Found ${links.length} story links. Crawling ${limit}...`);

  const stories: CrawledStory[] = [];
  for (let i = 0; i < limit; i++) {
    const link = links[i];
    const shortUrl = link.length > 60 ? link.slice(0, 57) + "..." : link;
    onProgress?.(i + 1, limit, `[${i + 1}/${limit}] ${shortUrl}`);

    try {
      await new Promise((r) => setTimeout(r, usePuppeteer ? 800 : 300));
      let storyHtml: string;
      try {
        storyHtml = await fetchHtml(link, usePuppeteer);
      } catch (e) {
        if (String(e).includes("403") && !usePuppeteer) {
          usePuppeteer = true;
          storyHtml = await fetchHtml(link, true);
        } else throw e;
      }
      const story = await extractFullStory(link, usePuppeteer, (msg) =>
        onProgress?.(i + 1, limit, msg)
      );
      if (story) stories.push(story);
    } catch (err) {
      onProgress?.(i + 1, limit, `[${i + 1}/${limit}] SKIP (${String(err).slice(0, 40)})`);
    }
    if ((i + 1) % batchSize === 0 && i + 1 < limit) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }
  return stories;
}
