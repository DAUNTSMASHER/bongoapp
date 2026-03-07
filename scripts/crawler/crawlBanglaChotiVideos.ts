/**
 * Crawler for BanglaChotiKahinii.com-style video listing pages.
 * Extracts video metadata (title, thumbnail, direct mp4/embed URL) so videos
 * can be played in-app without redirecting.
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
}

const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function resolveUrl(baseUrl: string, href: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res.text();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

/** Extract .mp4 / .webm / .m3u8 URL from HTML (common patterns) */
function extractDirectVideoUrl(html: string, baseUrl: string): string | undefined {
  const mp4Match = html.match(
    /https?:\/\/[^\s"'<>]+\.(mp4|webm|m3u8)[^\s"'<>]*/i
  );
  if (mp4Match) return mp4Match[0].replace(/["')\]]+$/, "");
  const relMatch = html.match(/["']?(\/videos\/get_file\/[^"'\s<>]+\.mp4[^"'\s<>]*)["']?/);
  if (relMatch) return resolveUrl(baseUrl, relMatch[1]);
  return undefined;
}

/** Extract iframe src from HTML */
function extractIframeSrc(html: string, baseUrl: string): string | undefined {
  const match = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (match) return resolveUrl(baseUrl, match[1]);
  return undefined;
}

/**
 * Parse listing page - extract video card links.
 * BanglaChotiKahinii: links like /videos/slug-here/
 */
function parseListingPage(html: string, baseUrl: string): Array<{ url: string; title: string; thumbnail?: string }> {
  const $ = cheerio.load(html);
  const items: Array<{ url: string; title: string; thumbnail?: string }> = [];
  const seen = new Set<string>();

  $('a[href*="/videos/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const full = resolveUrl(baseUrl, href);
    if (
      full.includes("/videos/tags/") ||
      full.includes("/videos/categories/") ||
      full.endsWith("/videos/") ||
      full === baseUrl
    )
      return;
    if (seen.has(full)) return;
    seen.add(full);
    const title =
      $(el).find("img").attr("alt") ||
      $(el).attr("title") ||
      $(el).text().trim().replace(/\s+/g, " ").slice(0, 120) ||
      "Video";
    const thumb = $(el).find("img").attr("src");
    items.push({
      url: full,
      title: title || "Video",
      thumbnail: thumb ? resolveUrl(baseUrl, thumb) : undefined,
    });
  });

  return items;
}

/**
 * Crawl a video detail page for playable URL (direct mp4 or iframe embed).
 */
async function crawlDetailPage(
  pageUrl: string,
  title: string,
  thumbnail?: string
): Promise<Partial<CrawledVideo>> {
  const html = await fetchHtml(pageUrl);
  const direct = extractDirectVideoUrl(html, pageUrl);
  const iframe = extractIframeSrc(html, pageUrl);
  const slug = pageUrl.replace(/\/$/, "").split("/").pop() || "v";
  const id = slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 60);

  return {
    id: `bck-${id}`,
    title,
    thumbnailUrl: thumbnail || "",
    outboundUrl: pageUrl,
    directVideoUrl: direct,
    embedUrl: !direct ? iframe : undefined,
    tags: [],
    sourceSite: "banglachotikahinii",
  };
}

/**
 * Crawl a BanglaChotiKahinii-style listing URL.
 * Returns Video-shaped objects with directVideoUrl or embedUrl for in-app playback.
 */
export async function crawlBanglaChotiListing(
  listingUrl: string,
  options?: { maxVideos?: number }
): Promise<CrawledVideo[]> {
  const max = options?.maxVideos ?? 10;
  const html = await fetchHtml(listingUrl);
  const items = parseListingPage(html, listingUrl).slice(0, max);
  const results: CrawledVideo[] = [];

  for (const item of items) {
    try {
      const detail = await crawlDetailPage(
        item.url,
        item.title,
        item.thumbnail
      );
      if (detail.directVideoUrl || detail.embedUrl) {
        results.push({
          id: detail.id!,
          title: detail.title!,
          thumbnailUrl: detail.thumbnailUrl || "",
          outboundUrl: detail.outboundUrl!,
          embedUrl: detail.embedUrl,
          directVideoUrl: detail.directVideoUrl,
          tags: detail.tags || [],
          sourceSite: detail.sourceSite || "banglachotikahinii",
        });
      }
    } catch {
      // skip failed
    }
  }

  return results;
}
