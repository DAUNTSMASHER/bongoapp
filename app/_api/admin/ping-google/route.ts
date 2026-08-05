import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/ping-google
 * Pings Google with the sitemap URL to request re-crawling.
 */
export async function POST(req: NextRequest) {
  try {
    const { sitemapUrl } = await req.json();
    const url = sitemapUrl || "https://www.bongochoti.com/sitemap.xml";

    // Google's sitemap ping endpoint
    const googlePing = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`
    );

    return NextResponse.json({
      ok: true,
      google: { status: googlePing.status, ok: googlePing.ok },
      message: `Sitemap ping sent to Google. Status: ${googlePing.status}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ping failed" },
      { status: 500 }
    );
  }
}
