/**
 * Smart Bangla Choti crawler with ML-style processing.
 * Crawls banglachotikahinii.com: listing → story links → detail pages.
 * Extracts: headline, body, blocks, character names, erotic tags.
 * Generates storyId for deduplication: {charCount}{characterNames}story
 * Propagates through categories until target count reached.
 */

import * as cheerio from "cheerio";
import { processStoryContent, type ProcessedStoryData } from "@/lib/storyMLProcessor";
import { extractStoryFromRawPageContent } from "@/lib/storyTextExtractor";
import { passesStoryQuality } from "@/lib/storyQualityFilter";
import type { CrawledStory } from "./crawlStories";
import {
  fetchHtmlWithFallback,
  fetchHtmlWithProvider,
  type FetchProvider,
  getAvailableProviders,
} from "@/lib/fetchHtmlProviders";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const CONTENT_SELECTORS = [
  ".post-body.entry-content",
  ".post-body",
  "article .entry-content",
  "article .post-content",
  ".entry-content",
  ".post-content",
  ".content-area .entry-content",
  ".site-content article .entry-content",
  "article",
  "main",
  ".post",
];

/** Map source site category paths to our slugs */
const CATEGORY_MAP: Record<string, string> = {
  "chachi-ba-kakike-chodar-kahini-bangla-choti-golpo": "ojachar",
  "jonopriyo-bangla-choti-kahini": "sera",
  "baba-meyeder-panu-choti-golpo": "ojachar",
  "bangla-choti-golpo": "sera",
  "mazhabi-panu-golper-asor": "sera",
  "bangla-incest-choti": "ojachar",
  "bandhobi-chodar": "bandhobi",
  "bandhobi": "bandhobi",
  "kajer-masi": "kajer-masi",
  "kajer-meye": "kajer-meye",
  "kumari-meye": "kumari-meye",
  "grihobodhur": "grihobodhur",
  "gay-sex": "gay-sex",
  "group-sex": "group-sex",
  "porokia": "porokia",
  "poripokkho": "poripokkho",
  "protibeshi": "protibeshi",
  "femdom": "femdom",
  "somokami": "somokami",
  "sera": "sera",
  "students": "students",
  "swami-strir": "swami-strir",
  "bangla-couple-sex-story": "swami-strir",
  "bangla-illicit-sex-story": "porokia",
  "bangla-housewife-sex-story": "grihobodhur",
  "hijra-shemale": "hijra-shemale",
};

function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

async function fetchHtmlPlaywright(url: string): Promise<string> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9,bn;q=0.8" });
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (!res || res.status() >= 400) throw new Error(`HTTP ${res?.status()}`);
    await new Promise((r) => setTimeout(r, 1500));
    const html = await page.content();
    await context.close();
    return html;
  } finally {
    await browser.close();
  }
}

async function fetchHtmlPuppeteer(url: string): Promise<string> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    if (!res || !res.ok()) throw new Error(`HTTP ${res?.status()}`);
    await new Promise((r) => setTimeout(r, 1500));
    return page.content();
  } finally {
    await browser.close();
  }
}

async function fetchHtml(url: string, mode: "fetch" | "playwright" | "puppeteer" = "fetch"): Promise<string> {
  if (mode === "playwright") return fetchHtmlPlaywright(url);
  if (mode === "puppeteer") return fetchHtmlPuppeteer(url);
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** Fetch using auto-browse providers (Firecrawl, BrowserCat) or fallback to local browser */
async function fetchHtmlSmart(
  url: string,
  options: { provider?: FetchProvider; preferredProviders?: FetchProvider[]; onProvider?: (p: FetchProvider) => void }
): Promise<string> {
  const { provider, preferredProviders, onProvider } = options;
  if (provider) {
    const html = await fetchHtmlWithProvider(url, provider);
    onProvider?.(provider);
    return html;
  }
  const { html, provider: used } = await fetchHtmlWithFallback(url, preferredProviders);
  onProvider?.(used);
  return html;
}

/** Link texts that are NOT story headlines (comment, nav, etc.) - skip these */
const NON_STORY_LINK_TEXTS = new Set([
  "leave a comment",
  "comment",
  "comments",
  "categories",
  "tags",
  "পরবর্তী পোস্ট",
  "পূর্ববর্তী পোস্ট",
  "next post",
  "previous post",
]);

function isStoryHeadlineLink(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t || t.length < 5 || t.length > 120) return false;
  if (NON_STORY_LINK_TEXTS.has(t)) return false;
  if (/^(category|tag|author|page)\s*:/i.test(t)) return false;
  return true;
}

/**
 * Extract story links from listing/category page.
 * Only uses headline/title links that lead to the full story page (not "Leave a comment", etc.).
 * The listing page shows short excerpts; clicking the headline opens the detail page with full content.
 */
export function extractStoryLinksFromListing(html: string, baseUrl: string): { url: string; title: string }[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const links: { url: string; title: string }[] = [];
  const baseHost = new URL(baseUrl).hostname;

  function tryAdd(href: string, title: string): boolean {
    if (!href || href.startsWith("#")) return false;
    if (href.includes("/category/") || href.includes("/tag/") || href.includes("/author/")) return false;
    if (!isStoryHeadlineLink(title)) return false;
    try {
      const u = new URL(href, baseUrl);
      if (u.hostname !== baseHost) return false;
      const path = u.pathname.replace(/\/$/, "");
      const segments = path.split("/").filter(Boolean);
      if (segments.length < 2) return false;
      if (path.match(/\/page\/\d+/)) return false;
      const abs = u.origin + u.pathname;
      if (seen.has(abs)) return false;
      seen.add(abs);
      links.push({ url: abs, title: title.trim() });
      return true;
    } catch {
      return false;
    }
  }

  // 1) Prefer headline links: per-article, get the main title link (leads to full story page)
  $("article, .post").each((_, articleEl) => {
    const $art = $(articleEl);
    const $titleLink = $art.find(".entry-title a[href], .post-title a[href], h2.entry-title a[href], h1.entry-title a[href]").first();
    if ($titleLink.length) {
      const href = $titleLink.attr("href");
      const title = $titleLink.text().trim();
      if (href && title) tryAdd(href, title);
      return;
    }
    const $headerLink = $art.find(".entry-header a[href], .post-header a[href]").first();
    if ($headerLink.length) {
      const href = $headerLink.attr("href");
      const title = $headerLink.text().trim();
      if (href && title) tryAdd(href, title);
      return;
    }
  });

  // 2) Fallback: any .entry-title a / .post-title a on the page
  if (links.length === 0) {
    $(".entry-title a[href], .post-title a[href]").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).text().trim();
      if (href && title) tryAdd(href, title);
    });
  }

  // 3) Last resort: article links excluding known non-story texts
  if (links.length === 0) {
    $("article a[href], .post a[href]").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).text().trim();
      if (href && title) tryAdd(href, title);
    });
  }

  return links;
}

/** Extract category links from page (sidebar/widget) */
function extractCategoryLinks(html: string, baseUrl: string): { url: string; slug: string }[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const links: { url: string; slug: string }[] = [];

  $('a[href*="/category/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const u = new URL(href, baseUrl);
      const m = u.pathname.match(/\/category\/([^/]+)/);
      if (!m) return;
      const slug = m[1];
      if (seen.has(slug)) return;
      seen.add(slug);
      const ourSlug = CATEGORY_MAP[slug] || slug.replace(/-/g, "-");
      links.push({ url: u.href, slug: ourSlug });
    } catch {
      /* skip */
    }
  });

  return links;
}

/** Extract headline, body, and source tags from story detail page */
function extractStoryDetail(html: string): { headline: string; body: string; sourceTags?: string[] } | null {
  const $ = cheerio.load(html);
  const headline = $("h1").first().text().trim() || $(".entry-title").first().text().trim() || $(".post-title").first().text().trim() || "";
  let body = "";
  let bestLen = 0;

  for (const sel of CONTENT_SELECTORS) {
    const el = $(sel).first();
    if (el.length) {
      const clone = el.clone();
      clone.find(".entry-footer, .categories, .tags, .related-posts, .nav-links, .widget, script, style").remove();
      const paras = clone.find("p");
      const paraTexts = paras.map((_, p) => $(p).text().trim()).get().filter((t) => t.length > 20);
      const candidate = paraTexts.length >= 1
        ? paraTexts.join("\n\n")
        : clone.text().trim().replace(/\n{3,}/g, "\n\n");
      if (candidate.length > bestLen && candidate.length > 100) {
        body = candidate;
        bestLen = candidate.length;
      }
    }
  }

  if (!body) body = $("p").map((_, p) => $(p).text().trim()).get().filter(Boolean).join("\n\n").trim();
  body = extractStoryFromRawPageContent(body || "");
  if (!body || body.length < 80) return null;

  const sourceTags: string[] = [];
  $('.tag-links a, .tags a, [rel="tag"], .entry-tags a, a[href*="/tag/"]').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length >= 2 && t.length <= 50) sourceTags.push(t);
  });

  return { headline: headline || "Untitled", body, sourceTags: sourceTags.length ? sourceTags : undefined };
}

export interface EnrichedCrawledStory extends CrawledStory {
  processed?: ProcessedStoryData;
  categorySlug?: string;
  /** Tags extracted from source page (for SEO) */
  sourceTags?: string[];
}

export type SmartCrawlProgress = (current: number, target: number, msg: string) => void;

/**
 * Smart crawl: start from URL, collect stories with ML processing,
 * propagate through categories until target count reached.
 */
export async function crawlBanglaChotiSmart(
  startUrl: string,
  targetCount: number,
  defaultCategorySlug: string,
  options?: {
    usePuppeteer?: boolean;
    usePlaywright?: boolean;
    useFirecrawl?: boolean;
    useBrowserCat?: boolean;
    fetchProvider?: FetchProvider;
    noPuppeteerFallback?: boolean;
    qualityFilter?: {
      minBodyLength?: number;
      minParagraphs?: number;
      rejectCtaEnding?: boolean;
      requireNarrativeEnding?: boolean;
    };
    onProgress?: SmartCrawlProgress;
    onProvider?: (p: FetchProvider) => void;
  }
): Promise<EnrichedCrawledStory[]> {
  const usePuppeteer = options?.usePuppeteer ?? false;
  const usePlaywright = options?.usePlaywright ?? false;
  const useFirecrawl = options?.useFirecrawl ?? false;
  const useBrowserCat = options?.useBrowserCat ?? false;
  const fetchProvider = options?.fetchProvider;
  const noPuppeteerFallback = options?.noPuppeteerFallback ?? false;
  const qualityFilter = options?.qualityFilter ?? {};
  const onProgress = options?.onProgress;
  const onProvider = options?.onProvider;

  const useAutoBrowse =
    useFirecrawl || useBrowserCat || fetchProvider != null || usePlaywright;
  const preferredProviders: FetchProvider[] = [];
  if (fetchProvider) preferredProviders.push(fetchProvider);
  if (useFirecrawl) preferredProviders.push("firecrawl");
  if (useBrowserCat) preferredProviders.push("browsercat");
  if (!preferredProviders.length) {
    preferredProviders.push("playwright", "firecrawl", "browsercat", "puppeteer", "fetch");
  }

  const fetchMode = (): "fetch" | "playwright" | "puppeteer" | "auto" => {
    if (useAutoBrowse) return "auto";
    if (usePuppeteer) return "puppeteer";
    return "fetch";
  };
  let mode = fetchMode();
  const stories: EnrichedCrawledStory[] = [];
  const seenStoryIds = new Set<string>();
  const visitedUrls = new Set<string>();
  const queue: { url: string; categorySlug: string }[] = [{ url: startUrl, categorySlug: defaultCategorySlug }];
  let pagesVisited = 0;

  while (stories.length < targetCount && queue.length > 0) {
    const { url, categorySlug } = queue.shift()!;
    if (visitedUrls.has(url)) continue;
    visitedUrls.add(url);

    onProgress?.(stories.length, targetCount, `Fetching ${url.slice(0, 60)}...`);

    const doFetch = async (): Promise<string> => {
      if (mode === "auto") {
        return fetchHtmlSmart(url, {
          preferredProviders,
          onProvider: (p) => onProgress?.(stories.length, targetCount, `  Using ${p}...`),
        });
      }
      return fetchHtml(url, mode as "fetch" | "playwright" | "puppeteer");
    };

    let html: string;
    try {
      html = await doFetch();
    } catch (e) {
      if (String(e).includes("403") && mode === "fetch" && !noPuppeteerFallback) {
        onProgress?.(stories.length, targetCount, "403 - retrying with Playwright...");
        try {
          html = await fetchHtml(url, "playwright");
          mode = "playwright";
        } catch {
          onProgress?.(stories.length, targetCount, "Playwright failed, trying Puppeteer...");
          html = await fetchHtml(url, "puppeteer");
          mode = "puppeteer";
        }
      } else if (mode === "auto" && !noPuppeteerFallback) {
        onProgress?.(stories.length, targetCount, "Auto-browse failed, retrying with Playwright...");
        try {
          html = await fetchHtml(url, "playwright");
          mode = "playwright";
        } catch {
          throw e;
        }
      } else {
        throw e;
      }
    }

    pagesVisited++;

    // On first page, collect category links for later
    if (pagesVisited === 1) {
      const catLinks = extractCategoryLinks(html, url);
      for (const c of catLinks.slice(0, 8)) {
        if (!visitedUrls.has(c.url)) queue.push({ url: c.url, categorySlug: c.slug });
      }
    }

    const storyEntries = extractStoryLinksFromListing(html, url);
    const toFetch = storyEntries.slice(0, Math.min(15, targetCount - stories.length + 5));

    for (const entry of toFetch) {
      if (stories.length >= targetCount) break;
      if (visitedUrls.has(entry.url)) continue;

      onProgress?.(stories.length, targetCount, `[${stories.length + 1}/${targetCount}] ${entry.title.slice(0, 40)}...`);

      await new Promise((r) => setTimeout(r, mode !== "fetch" ? 800 : 300));

      try {
        const detailHtml =
          mode === "auto"
            ? await fetchHtmlSmart(entry.url, { preferredProviders })
            : await fetchHtml(entry.url, mode as "fetch" | "playwright" | "puppeteer");
        const detail = extractStoryDetail(detailHtml);
        if (!detail) continue;

        const quality = passesStoryQuality(detail.body, {
          minBodyLength: qualityFilter.minBodyLength ?? 800,
          minParagraphs: qualityFilter.minParagraphs ?? 1,
          rejectCtaEnding: qualityFilter.rejectCtaEnding ?? true,
          requireNarrativeEnding: qualityFilter.requireNarrativeEnding ?? false,
        });
        if (!quality.passes) {
          onProgress?.(stories.length, targetCount, `  Skip: ${quality.reason}`);
          continue;
        }

        const processed = processStoryContent(detail.body, detail.headline);

        if (seenStoryIds.has(processed.storyId)) continue;
        seenStoryIds.add(processed.storyId);

        const summary = detail.body.slice(0, 150).trim() + (detail.body.length > 150 ? "…" : "");

        stories.push({
          title: processed.headline,
          body: processed.body,
          summary,
          sourceUrl: entry.url,
          processed,
          categorySlug,
          sourceTags: detail.sourceTags,
        });
      } catch {
        /* skip this story */
      }
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  return stories;
}

/**
 * Crawl stories from multiple listing/category pages (e.g. page/130, page/131...).
 * Extracts story links from each listing, then fetches and processes each story.
 */
export async function crawlStoriesFromListingPages(
  listingPageUrls: string[],
  categorySlug: string,
  options?: {
    useFirecrawl?: boolean;
    usePlaywright?: boolean;
    qualityFilter?: { minBodyLength?: number; minParagraphs?: number; rejectCtaEnding?: boolean };
    onProgress?: (msg: string) => void;
  }
): Promise<EnrichedCrawledStory[]> {
  const preferredProviders: FetchProvider[] = options?.useFirecrawl
    ? ["firecrawl", "browsercat", "fetch"]
    : ["playwright", "firecrawl", "browsercat", "puppeteer", "fetch"];
  const onProgress = options?.onProgress;
  const allStoryUrls = new Set<string>();

  for (let i = 0; i < listingPageUrls.length; i++) {
    const url = listingPageUrls[i].trim();
    if (!url.startsWith("http")) continue;
    onProgress?.(`[${i + 1}/${listingPageUrls.length}] Fetching listing ${url.slice(-40)}...`);
    try {
      const { html } = await fetchHtmlWithFallback(url, preferredProviders);
      const entries = extractStoryLinksFromListing(html, url);
      for (const e of entries) allStoryUrls.add(e.url);
      onProgress?.(`  Found ${entries.length} links (total unique: ${allStoryUrls.size})`);
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      onProgress?.(`  Failed: ${String(e).slice(0, 60)}`);
    }
  }

  const urls = Array.from(allStoryUrls);
  onProgress?.(`Crawling ${urls.length} story pages...`);
  return crawlStoriesFromUrls(urls, categorySlug, {
    ...options,
    useFirecrawl: options?.useFirecrawl,
    usePlaywright: options?.usePlaywright ?? true,
    onProgress: options?.onProgress
      ? (done, total, msg) => options.onProgress?.(`[${done}/${total}] ${msg}`)
      : undefined,
  });
}

/** Crawl multiple story URLs directly (no listing). For use when user pastes links. */
export async function crawlStoriesFromUrls(
  urls: string[],
  categorySlug: string,
  options?: {
    useFirecrawl?: boolean;
    usePlaywright?: boolean;
    qualityFilter?: { minBodyLength?: number; minParagraphs?: number; rejectCtaEnding?: boolean };
    onProgress?: (done: number, total: number, msg: string) => void;
    preferredProviders?: FetchProvider[];
  }
): Promise<EnrichedCrawledStory[]> {
  const preferredProviders: FetchProvider[] =
    options?.preferredProviders ??
    (options?.useFirecrawl
      ? ["firecrawl", "browsercat", "fetch"]
      : ["playwright", "firecrawl", "browsercat", "puppeteer", "fetch"]);
  const qualityFilter = options?.qualityFilter ?? {
    minBodyLength: 800,
    minParagraphs: 1,
    rejectCtaEnding: true,
  };
  const onProgress = options?.onProgress;
  const stories: EnrichedCrawledStory[] = [];
  const seenStoryIds = new Set<string>();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].trim();
    if (!url.startsWith("http")) continue;
    onProgress?.(stories.length, urls.length, `[${i + 1}/${urls.length}] ${url.slice(0, 50)}...`);
    try {
      const { html } = await fetchHtmlWithFallback(url, preferredProviders);
      const detail = extractStoryDetail(html);
      if (!detail) continue;
      const quality = passesStoryQuality(detail.body, qualityFilter);
      if (!quality.passes) continue;
      const processed = processStoryContent(detail.body, detail.headline);
      if (seenStoryIds.has(processed.storyId)) continue;
      seenStoryIds.add(processed.storyId);
      const summary = detail.body.slice(0, 150).trim() + (detail.body.length > 150 ? "…" : "");
      stories.push({
        title: processed.headline,
        body: processed.body,
        summary,
        sourceUrl: url,
        processed,
        categorySlug,
        sourceTags: detail.sourceTags,
      });
      await new Promise((r) => setTimeout(r, 400));
    } catch {
      /* skip failed URL */
    }
  }
  return stories;
}
