/**
 * Web search + video extraction.
 * Uses Serper API (serper.dev) to search, then crawls result URLs for video links.
 * Set SERPER_API_KEY in env. Free tier: 2,500 searches.
 */

import * as cheerio from "cheerio";

export interface SearchVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  outboundUrl: string;
  embedUrl?: string;
  directVideoUrl?: string;
  tags: string[];
  sourceSite: string;
}

const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function slugify(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "").split("/").pop() || "v";
    return path.replace(/[^a-z0-9-]/gi, "-").slice(0, 50);
  } catch {
    return "v";
  }
}

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
  const res = await fetch(url, {
    signal: controller.signal,
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*;q=0.8" },
    redirect: "follow",
  });
  clearTimeout(timeout);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractDirectVideoUrl(html: string, baseUrl: string): string | undefined {
  const m = html.match(/https?:\/\/[^\s"'<>]+\.(mp4|webm|m3u8)[^\s"'<>]*/i);
  if (m) return m[0].replace(/["')\]]+$/, "");
  const rel = html.match(/["']?(\/videos\/get_file\/[^"'\s<>]+\.mp4[^"'\s<>]*)["']?/);
  if (rel) return resolveUrl(baseUrl, rel[1]);
  return undefined;
}

function extractIframeSrc(html: string, baseUrl: string): string | undefined {
  const m = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return m ? resolveUrl(baseUrl, m[1]) : undefined;
}

function extractTitle(html: string, fallback: string): string {
  const $ = cheerio.load(html);
  const title = $("title").text().trim() || $('meta[property="og:title"]').attr("content") || fallback;
  return title.replace(/\s+/g, " ").slice(0, 150) || fallback;
}

function extractThumbnail(html: string, baseUrl: string): string {
  const $ = cheerio.load(html);
  const og = $('meta[property="og:image"]').attr("content");
  if (og) return resolveUrl(baseUrl, og);
  const img = $("img").first().attr("src");
  return img ? resolveUrl(baseUrl, img) : "";
}

/**
 * Extract video from a page URL.
 */
export async function extractVideoFromUrl(
  pageUrl: string,
  fallbackTitle?: string
): Promise<SearchVideo | null> {
  try {
    const html = await fetchHtml(pageUrl);
    const direct = extractDirectVideoUrl(html, pageUrl);
    const iframe = extractIframeSrc(html, pageUrl);
    if (!direct && !iframe) return null;

    const title = extractTitle(html, fallbackTitle || "Video");
    const thumb = extractThumbnail(html, pageUrl);
    const id = `search-${slugify(pageUrl)}`;

    return {
      id,
      title,
      thumbnailUrl: thumb,
      outboundUrl: pageUrl,
      directVideoUrl: direct,
      embedUrl: !direct ? iframe : undefined,
      tags: [],
      sourceSite: "web-search",
    };
  } catch {
    return null;
  }
}

/** YouTube ID from various URL formats */
function youtubeEmbedUrl(url: string): string | undefined {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return undefined;
}

/**
 * Search videos via Serper. Uses /videos endpoint first (direct video links, no crawl).
 * Falls back to /search + page crawl if videos returns few results.
 * Processes organic crawl in batches to reduce pressure.
 * Requires SERPER_API_KEY.
 */
export async function searchAndExtractVideos(
  query: string,
  maxVideos = 20,
  options?: { maxOrganicCrawl?: number }
): Promise<SearchVideo[]> {
  const maxOrganic = Math.min(options?.maxOrganicCrawl ?? 10, 20);
  const key = process.env.SERPER_API_KEY;
  if (!key) throw new Error("SERPER_API_KEY not set. Get free key at serper.dev");

  const videos: SearchVideo[] = [];
  const seen = new Set<string>();

  // 1) Try Serper videos endpoint - returns direct video URLs (YouTube, etc)
  try {
    const vRes = await fetch("https://google.serper.dev/videos", {
      method: "POST",
      headers: {
        "X-API-KEY": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: Math.min(maxVideos, 20) }),
    });
    if (vRes.ok) {
      const vData = (await vRes.json()) as {
        video?: Array<{ link?: string; url?: string; title?: string; thumbnail?: string; thumbnailUrl?: string }>;
        videos?: Array<{ link?: string; url?: string; title?: string; thumbnail?: string; thumbnailUrl?: string }>;
      };
      const list = vData.video || vData.videos || [];
      for (const v of list) {
        if (videos.length >= maxVideos) break;
        const link = v?.link || v?.url;
        if (!link || seen.has(link)) continue;
        seen.add(link);
        const thumb = v?.thumbnail || v?.thumbnailUrl || "";
        const embed = youtubeEmbedUrl(link);
        if (embed) {
          videos.push({
            id: `search-${slugify(link)}`,
            title: (v.title || "Video").slice(0, 150),
            thumbnailUrl: thumb,
            outboundUrl: link,
            embedUrl: embed,
            tags: [],
            sourceSite: "serper-videos",
          });
        } else {
          videos.push({
            id: `search-${slugify(link)}`,
            title: (v.title || "Video").slice(0, 150),
            thumbnailUrl: thumb,
            outboundUrl: link,
            tags: [],
            sourceSite: "serper-videos",
          });
        }
      }
    }
  } catch {
    // videos API failed, fall through to organic
  }

  // 2) If we need more, use organic search + crawl pages (batched to reduce pressure)
  if (videos.length < maxVideos) {
    const toCrawl = Math.min(maxVideos - videos.length, maxOrganic);
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: Math.min(toCrawl, 15) }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        organic?: Array<{ link: string; title: string }>;
      };
      const urls = (data.organic || []).slice(0, toCrawl).map((o) => ({ url: o.link, title: o.title }));
      for (const { url, title } of urls) {
        if (videos.length >= maxVideos) break;
        if (seen.has(url)) continue;
        seen.add(url);
        try {
          await new Promise((r) => setTimeout(r, 600));
          const v = await extractVideoFromUrl(url, title);
          if (v && (v.directVideoUrl || v.embedUrl)) {
            videos.push(v);
          }
        } catch {
          // skip
        }
      }
    }
  }

  return videos;
}
