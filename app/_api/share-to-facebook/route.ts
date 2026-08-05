/**
 * Post to Facebook Page feed.
 * Accepts pageId, pageAccessToken, message, link. Proxies to Graph API.
 */

import { NextResponse } from "next/server";

const GRAPH = "https://graph.facebook.com/v21.0";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, pageAccessToken, message, link } = body as {
      pageId?: string;
      pageAccessToken?: string;
      message?: string;
      link?: string;
    };

    if (!pageId || !pageAccessToken || !message) {
      return NextResponse.json(
        { error: "pageId, pageAccessToken, and message required" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      message,
      access_token: pageAccessToken,
    });
    if (link) params.set("link", link);

    const res = await fetch(`${GRAPH}/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = (await res.json()) as { id?: string; error?: { message: string } };
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Facebook API error" },
        { status: 502 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
