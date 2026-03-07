/**
 * Video link crawler – fetches HTML and extracts all candidate video links.
 * Node 18+, TypeScript. Static HTML only (no Puppeteer/Playwright).
 *
 * Usage:
 *   const links = await crawlVideoLinks('https://example.com/some-page');
 */

import * as cheerio from "cheerio";

export interface VideoLink {
  type: "video" | "iframe" | "embed" | "anchor";
  src: string; // iframe src, video src, or href
  text?: string; // optional text around the link (e.g. link text)
  sourceUrl: string; // the pageUrl where it was found
}

/** Video file extensions to treat as video links from <a href="..."> */
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".m3u8"];

/**
 * Placeholder: known video player domains for <a href="...">.
 * Add your own, e.g. ['youtube.com', 'vimeo.com', 'dailymotion.com'].
 */
const KNOWN_VIDEO_DOMAINS: string[] = [];

/** Default request timeout (ms). */
const FETCH_TIMEOUT_MS = 15000;

/**
 * Resolves a possibly relative URL against the page base URL.
 */
function resolveUrl(baseUrl: string, href: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

/**
 * Returns true if the URL is HTTP or HTTPS.
 */
function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Returns true if href looks video-like (extension or known domain).
 */
function isVideoLikeHref(href: string): boolean {
  if (!href || typeof href !== "string") return false;
  const lower = href.toLowerCase().trim();
  if (VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext) || lower.includes(ext + "?")))
    return true;
  if (KNOWN_VIDEO_DOMAINS.length && KNOWN_VIDEO_DOMAINS.some((d) => lower.includes(d)))
    return true;
  return false;
}

/**
 * Fetches HTML for the given page URL.
 * Uses built-in fetch (Node 18+). Handles non-200 and timeouts.
 */
async function fetchHtml(pageUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VideoCrawler/1.0; +https://example.com)",
      },
      redirect: "follow",
    });
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("abort")) {
      throw new Error(`Request timeout after ${FETCH_TIMEOUT_MS}ms: ${pageUrl}`);
    }
    throw new Error(`Fetch failed: ${message}`);
  }
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${pageUrl}`);
  }
  return res.text();
}

/**
 * Crawls the given page URL and returns all candidate video links.
 * Normalizes URLs to absolute and filters out empty / non-HTTP(S).
 */
export async function crawlVideoLinks(pageUrl: string): Promise<VideoLink[]> {
  const html = await fetchHtml(pageUrl);
  const $ = cheerio.load(html);
  const links: VideoLink[] = [];

  // ----- <video> and nested <source> -----
  $("video").each((_, el) => {
    const $el = $(el);
    const src = $el.attr("src");
    if (src) {
      const absolute = resolveUrl(pageUrl, src);
      if (absolute && isHttpUrl(absolute)) {
        links.push({ type: "video", src: absolute, sourceUrl: pageUrl });
      }
    }
    $el.find("source").each((_, s) => {
      const ssrc = $(s).attr("src");
      if (ssrc) {
        const absolute = resolveUrl(pageUrl, ssrc);
        if (absolute && isHttpUrl(absolute)) {
          links.push({ type: "video", src: absolute, sourceUrl: pageUrl });
        }
      }
    });
  });

  // ----- <iframe> -----
  $("iframe").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      const absolute = resolveUrl(pageUrl, src);
      if (absolute && isHttpUrl(absolute)) {
        links.push({ type: "iframe", src: absolute, sourceUrl: pageUrl });
      }
    }
  });

  // ----- <embed> and <object> -----
  $("embed").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      const absolute = resolveUrl(pageUrl, src);
      if (absolute && isHttpUrl(absolute)) {
        links.push({ type: "embed", src: absolute, sourceUrl: pageUrl });
      }
    }
  });
  $("object").each((_, el) => {
    const $el = $(el);
    const data = $el.attr("data");
    const src = data || $el.attr("src");
    if (src) {
      const absolute = resolveUrl(pageUrl, src);
      if (absolute && isHttpUrl(absolute)) {
        links.push({ type: "embed", src: absolute, sourceUrl: pageUrl });
      }
    }
  });

  // ----- <a href="..."> where href looks video-like -----
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || !href.trim()) return;
    const absolute = resolveUrl(pageUrl, href.trim());
    if (!isHttpUrl(absolute) || !isVideoLikeHref(absolute)) return;
    const text = $(el).text().trim() || undefined;
    links.push({ type: "anchor", src: absolute, text, sourceUrl: pageUrl });
  });

  return links;
}
