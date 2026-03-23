/**
 * Crawler for BanglaChotiKahinii.com-style video listing pages.
 * Extracts iframe/embed when available; otherwise stores outboundUrl (landing page)
 * for link-out. Does not rip raw .mp4/.m3u8; treats external sites as partners.
 */

import * as cheerio from "cheerio";

export interface CrawledVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  outboundUrl: string;
  embedUrl?: string;
  directVideoUrl?: string; // .mp4, .webm, .m3u8 - play in our <video> player
  tags: string[];
  sourceSite: string;
  /** Duration like "0:58" or "18:31" (parsed from BCK card) */
  duration?: string;
  /** View count (parsed from "340K", "2.2M" etc.) */
  viewCount?: number;
  /** HD/720p etc. from card badge */
  resolution?: string;
}

const FETCH_TIMEOUT_MS = 20000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function resolveUrl(baseUrl: string, href: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

const PUPPETEER_ERROR_MSG =
  "Chrome not found. Run: npx puppeteer browsers install chrome. Or run crawl from local dev (npm run dev).";

async function fetchWithPuppeteer(url: string): Promise<string> {
  const puppeteer = await import("puppeteer");
  let browser;
  try {
    browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
    });
  } catch (e) {
    const msg = String(e);
    if (msg.includes("Could not find Chrome") || msg.includes("puppeteer") || msg.includes("Chrome")) {
      throw new Error(PUPPETEER_ERROR_MSG);
    }
    throw e;
  }
  try {
    const page = await browser!.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.setJavaScriptEnabled(true);
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: FETCH_TIMEOUT_MS });
    if (!res || res.status() === 403) throw new Error("HTTP 403");
    if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
    await new Promise((r) => setTimeout(r, 1500));
    const html = await page.content();
    await page.close();
    return html;
  } finally {
    await browser!.close();
  }
}

async function fetchHtml(url: string, usePuppeteer = false): Promise<string> {
  if (usePuppeteer) return fetchWithPuppeteer(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

/** Extract .mp4 / .webm / .m3u8 URL from HTML (common patterns) */
function extractDirectVideoUrl(html: string, baseUrl: string): string | undefined {
  // BanglaChoti: /videos/get_file/xxx.mp4
  const relMatch = html.match(/["']?(\/videos\/get_file\/[^"'\s<>]+\.mp4[^"'\s<>]*)["']?/);
  if (relMatch) return resolveUrl(baseUrl, relMatch[1]);
  // Full URL mp4/webm/m3u8
  const mp4Match = html.match(
    /https?:\/\/[^\s"'<>]+\.(mp4|webm|m3u8)[^\s"'<>]*/i
  );
  if (mp4Match) {
    const url = mp4Match[0].replace(/["')\]]+$/, "");
    if (!/screenshot|thumb|preview/i.test(url)) return url;
  }
  // video source src="..."
  const srcMatch = html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|webm|m3u8)[^"']*)["']/i);
  if (srcMatch) return resolveUrl(baseUrl, srcMatch[1]);
  // data-src or data-video (lazy-loaded)
  const dataSrc = html.match(/data-(?:src|video)=["']([^"']+\.(?:mp4|webm|m3u8)[^"']*)["']/i);
  if (dataSrc) return resolveUrl(baseUrl, dataSrc[1]);
  return undefined;
}

/**
 * Extract iframe/embed/video URLs from HTML using Cheerio.
 * Per best practice: store embed or landing URL, not raw .mp4/.m3u8.
 */
function extractEmbedOrVideoUrl(html: string, baseUrl: string): string | undefined {
  const $ = cheerio.load(html);
  // Prefer /videos/embed/ID – works anywhere, designed for embedding
  const embedMatch = html.match(/["']([^"']*\/videos\/embed\/\d+[^"']*)["']/);
  if (embedMatch) return resolveUrl(baseUrl, embedMatch[1]);
  // iframe src (most common for embed players)
  const iframe = $("iframe[src]").first().attr("src");
  if (iframe) return resolveUrl(baseUrl, iframe);
  // iframe data-src (lazy-loaded)
  const iframeDataSrc = $("iframe[data-src]").first().attr("data-src");
  if (iframeDataSrc) return resolveUrl(baseUrl, iframeDataSrc);
  // embed src
  const embed = $("embed[src]").first().attr("src");
  if (embed) return resolveUrl(baseUrl, embed);
  // object data
  const object = $("object[data]").first().attr("data");
  if (object) return resolveUrl(baseUrl, object);
  // Fallback: regex for iframe (catches dynamically injected)
  const match = html.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
  if (match) return resolveUrl(baseUrl, match[1]);
  return undefined;
}

/** Parse "340K", "2.2M" to number */
function parseViewCount(str: string): number | undefined {
  const m = str.match(/^([\d.]+)\s*([KMB])?$/i);
  if (!m) return undefined;
  let n = parseFloat(m[1]);
  const unit = (m[2] || "").toUpperCase();
  if (unit === "K") n *= 1000;
  else if (unit === "M") n *= 1_000_000;
  else if (unit === "B") n *= 1_000_000_000;
  return Math.round(n);
}

/**
 * Parse listing page - extract video card links.
 * BanglaChotiKahinii: cards show "HD0:58 Title 340K 88% 9 months ago"
 */
function parseListingPage(
  html: string,
  baseUrl: string
): Array<{ url: string; title: string; thumbnail?: string; duration?: string; viewCount?: number; resolution?: string }> {
  const $ = cheerio.load(html);
  const items: Array<{
    url: string;
    title: string;
    thumbnail?: string;
    duration?: string;
    viewCount?: number;
    resolution?: string;
  }> = [];
  const seen = new Set<string>();

  $('a[href*="/videos/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const full = resolveUrl(baseUrl, href);
    if (
      full.includes("/videos/tags/") ||
      full.includes("/videos/categories/") ||
      full.endsWith("/videos/") ||
      full.includes("/videos/top-rated") ||
      full.includes("/videos/latest-updates") ||
      full.includes("/videos/most-popular") ||
      full === baseUrl
    )
      return;
    if (seen.has(full)) return;
    if (
      full.includes("/terms") ||
      full.includes("/dmca") ||
      full.includes("/2257") ||
      full.includes("/contact") ||
      full.includes("/privacy")
    )
      return;
    seen.add(full);
    const rawText = $(el).text().trim().replace(/\s+/g, " ");
    const imgAlt = $(el).find("img").attr("alt");
    const title =
      imgAlt?.trim() ||
      $(el).attr("title")?.trim() ||
      rawText.slice(0, 120) ||
      "Video";
    if (/^(Terms|DMCA|18\s*U\.?S\.?C\.?|Contact|Privacy)$/i.test(title.trim())) return;
    const thumb = $(el).find("img").attr("src");

    // Parse duration (0:58, 18:31), views (340K, 2.2M), HD badge from card text
    let duration: string | undefined;
    let viewCount: number | undefined;
    let resolution: string | undefined;
    const durMatch = rawText.match(/(?:HD)?(\d{1,2}:\d{2})\b/);
    if (durMatch) {
      duration = durMatch[1];
      if (/^HD/i.test(rawText)) resolution = "HD";
    }
    const viewMatch = rawText.match(/\b([\d.]+)\s*([KMB])\b/i);
    if (viewMatch) viewCount = parseViewCount(viewMatch[1] + (viewMatch[2] || ""));

    items.push({
      url: full,
      title: title || "Video",
      thumbnail: thumb ? resolveUrl(baseUrl, thumb) : undefined,
      duration,
      viewCount,
      resolution,
    });
  });

  return items;
}

/**
 * Crawl a video detail page. Extract embed/iframe when available;
 * otherwise store outboundUrl (landing page) for link-out to source site.
 */
async function crawlDetailPage(
  pageUrl: string,
  item: { title: string; thumbnail?: string; duration?: string; viewCount?: number; resolution?: string },
  usePuppeteer = false
): Promise<Partial<CrawledVideo>> {
  const html = await fetchHtml(pageUrl, usePuppeteer);
  const direct = extractDirectVideoUrl(html, pageUrl);
  const embed = extractEmbedOrVideoUrl(html, pageUrl);
  const slug = pageUrl.replace(/\/$/, "").split("/").pop() || "v";
  const id = slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 60);

  return {
    id: `bck-${id}`,
    title: item.title,
    thumbnailUrl: item.thumbnail || "",
    outboundUrl: pageUrl,
    directVideoUrl: direct,
    embedUrl: embed, // always save when found – /videos/embed/ID works better than get_file
    tags: [],
    sourceSite: "banglachotikahinii",
    duration: item.duration,
    viewCount: item.viewCount,
    resolution: item.resolution,
  };
}

/**
 * Crawl a BanglaChotiKahinii-style listing URL.
 * Returns Video-shaped objects with directVideoUrl or embedUrl for in-app playback.
 */
export type CrawlProgressCallback = (current: number, total: number, message: string) => void;

export async function crawlBanglaChotiListing(
  listingUrl: string,
  options?: { maxVideos?: number; usePuppeteer?: boolean; onProgress?: CrawlProgressCallback }
): Promise<CrawledVideo[]> {
  const max = options?.maxVideos ?? 10;
  const onProgress = options?.onProgress;
  let usePuppeteer = options?.usePuppeteer ?? false;
  let html: string;
  onProgress?.(0, max, "Fetching listing page...");
  try {
    html = await fetchHtml(listingUrl, usePuppeteer);
  } catch (e) {
    if (String(e).includes("403") && !usePuppeteer) {
      onProgress?.(0, max, "403 - Retrying with Puppeteer (browser)...");
      usePuppeteer = true;
      html = await fetchHtml(listingUrl, true);
    } else {
      throw e;
    }
  }
  const items = parseListingPage(html, listingUrl).slice(0, max);
  const results: CrawledVideo[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.(i, items.length, `Crawling ${i + 1}/${items.length}: ${item.title.slice(0, 40)}...`);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const detail = await crawlDetailPage(item.url, item, usePuppeteer);
      // Always include: outboundUrl (landing page) is enough for link-out. User clicks to watch on source.
      if (detail.id && detail.outboundUrl) {
        results.push({
          id: detail.id,
          title: detail.title!,
          thumbnailUrl: detail.thumbnailUrl || "",
          outboundUrl: detail.outboundUrl,
          embedUrl: detail.embedUrl,
          directVideoUrl: detail.directVideoUrl,
          tags: detail.tags || [],
          sourceSite: detail.sourceSite || "banglachotikahinii",
          duration: detail.duration,
          viewCount: detail.viewCount,
          resolution: detail.resolution,
        });
      }
    } catch {
      // Detail fetch failed (403, timeout, etc). Still save with listing data for link-out.
      const slug = item.url.replace(/\/$/, "").split("/").pop() || "v";
      const id = `bck-${slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 60)}`;
      results.push({
        id,
        title: item.title || "Video",
        thumbnailUrl: item.thumbnail || "",
        outboundUrl: item.url,
        tags: [],
        sourceSite: "banglachotikahinii",
        duration: item.duration,
        viewCount: item.viewCount,
        resolution: item.resolution,
      });
    }
  }

  return results;
}
