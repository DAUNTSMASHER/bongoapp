import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const FETCH_TIMEOUT_MS = 15000;
const MAX_HTML_LENGTH = 500_000;

export type MarketingAuditResult = {
  url: string;
  ok: boolean;
  error?: string;
  title?: string;
  titleLength?: number;
  titleOk?: boolean; // 50–60 chars
  metaDescription?: string;
  metaLength?: number;
  hasH1?: boolean;
  h1Text?: string[];
  headings?: { h2: number; h3: number; h4: number; h5: number; h6: number };
  headingTexts?: { tag: string; text: string }[];
  keywordConsistency?: {
    inTitle: string[];
    inMeta: string[];
    inHeadings: string[];
    suggested: string[];
  };
  recommendations: string[];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "URL must be http or https" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BongoChotiMarketingAudit/1.0; +https://bongochoti.com)",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed: ${res.status} ${res.statusText}` },
        { status: 502 }
      );
    }
    const html = await res.text();
    if (html.length > MAX_HTML_LENGTH) {
      return NextResponse.json(
        { error: `Page too large (${(html.length / 1000).toFixed(0)}k chars)` },
        { status: 502 }
      );
    }

    const $ = cheerio.load(html);
    const title = $("title").first().text().replace(/\s+/g, " ").trim();
    const titleLength = title.length;
    const titleOk = titleLength >= 50 && titleLength <= 60;

    let metaDescription = "";
    $('meta[name="description"]').each((_, el) => {
      const c = $(el).attr("content");
      if (c && !metaDescription) metaDescription = c.replace(/\s+/g, " ").trim();
    });
    const metaLength = metaDescription.length;

    const h1Text: string[] = [];
    $("h1").each((_, el) => {
      h1Text.push($(el).text().replace(/\s+/g, " ").trim());
    });
    const hasH1 = h1Text.length > 0;

    const headingTexts: { tag: string; text: string }[] = [];
    ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
      $(tag).each((_, el) => {
        headingTexts.push({ tag, text: $(el).text().replace(/\s+/g, " ").trim() });
      });
    });
    const headings = {
      h2: $("h2").length,
      h3: $("h3").length,
      h4: $("h4").length,
      h5: $("h5").length,
      h6: $("h6").length,
    };

    // Simple keyword extraction from title + meta (words that look like main keywords)
    const combined = `${title} ${metaDescription}`.toLowerCase();
    const words = combined.split(/\s+/).filter((w) => w.length > 2);
    const suggested = [...new Set(words)].slice(0, 12);
    const inTitle = suggested.filter((w) => title.toLowerCase().includes(w));
    const inMeta = suggested.filter((w) => metaDescription.toLowerCase().includes(w));
    const allHeadingText = headingTexts.map((h) => h.text.toLowerCase()).join(" ");
    const inHeadings = suggested.filter((w) => allHeadingText.includes(w));

    const recommendations: string[] = [];
    if (!hasH1) recommendations.push("Add a single H1 tag that describes the page.");
    if (titleLength < 50 || titleLength > 60) {
      recommendations.push(
        `Shorten title to 50–60 characters (current: ${titleLength}).`
      );
    }
    if (metaLength < 120) {
      recommendations.push("Meta description should be at least ~120 characters.");
    }
    if (headings.h2 + headings.h3 === 0 && headingTexts.length > 1) {
      recommendations.push("Use H2/H3 to structure content and keywords.");
    }

    const result: MarketingAuditResult = {
      url,
      ok: true,
      title: title || undefined,
      titleLength: title.length ? titleLength : undefined,
      titleOk,
      metaDescription: metaDescription || undefined,
      metaLength: metaDescription ? metaLength : undefined,
      hasH1,
      h1Text: h1Text.length ? h1Text : undefined,
      headings,
      headingTexts: headingTexts.length ? headingTexts : undefined,
      keywordConsistency: {
        inTitle,
        inMeta,
        inHeadings,
        suggested,
      },
      recommendations,
    };

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Audit failed";
    return NextResponse.json(
      { error: message, ok: false },
      { status: 500 }
    );
  }
}
