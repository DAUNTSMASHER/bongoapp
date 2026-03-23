/**
 * Admin API: crawl BanglaChotiKahinii URL(s), extract videos (direct mp4/embed), save to Firestore.
 * POST { "url": "...", "urls": ["...", "..."], "maxVideos": 10, "batchSize": 5, "stream": true }
 * - stream: true → returns NDJSON stream with progress events
 * Returns { extracted, inserted, skipped, updated, message } or stream
 */

import { NextResponse } from "next/server";

export const maxDuration = 300; // 100 videos with Puppeteer can take several minutes
import { crawlBanglaChotiListing } from "@/scripts/crawler/crawlBanglaChotiVideos";
import { saveCrawledVideosToFirestore } from "@/scripts/crawler/saveCrawledVideos";
import { saveCrawledVideosToGitHub } from "@/scripts/crawler/saveCrawledVideosToGitHub";

function ndjson(obj: object): string {
  return JSON.stringify(obj) + "\n";
}

export async function POST(req: Request) {
  const body = await req.json();
  const singleUrl = typeof body?.url === "string" ? body.url.trim() : "";
  const urlsArr = Array.isArray(body?.urls)
    ? (body.urls as string[]).filter((u: unknown) => typeof u === "string" && (u as string).trim().startsWith("http"))
    : [];
  const urls = singleUrl ? [singleUrl] : urlsArr;

  const maxVideos = Math.min(Math.max(Number(body?.maxVideos) || 100, 3), 100);
  const batchSize = Math.min(Math.max(Number(body?.batchSize) || 100, 3), 100);
  const stream = body?.stream === true;

  if (urls.length === 0) {
    return NextResponse.json({ error: "Missing or invalid url / urls" }, { status: 400 });
  }
  for (const u of urls) {
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      return NextResponse.json({ error: "Each URL must start with http:// or https://" }, { status: 400 });
    }
  }

  const limit = Math.min(maxVideos, batchSize);
  const isVercel = Boolean(process.env.VERCEL);
  const usePuppeteer = !isVercel && body?.usePuppeteer !== false;
  const forceUpsert = body?.forceUpsert !== false;
  const useGitHub = Boolean(process.env.GITHUB_TOKEN?.trim() && process.env.GITHUB_REPO?.trim());

  if (stream) {
    const encoder = new TextEncoder();
    const streamRes = new ReadableStream({
      async start(controller) {
        try {
          if (isVercel) {
            controller.enqueue(
              encoder.encode(
                ndjson({
                  type: "status",
                  message:
                    "Running on serverless (fetch only). If blocked, run locally: npm run dev → Admin → Videos.",
                })
              )
            );
          }
          const allVideos: Awaited<ReturnType<typeof crawlBanglaChotiListing>> = [];
          const seenIds = new Set<string>();
          let globalCurrent = 0;
          const totalEstimate = urls.length * limit;

          for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
            const url = urls[urlIndex];
            controller.enqueue(
              encoder.encode(
                ndjson({
                  type: "section",
                  urlIndex: urlIndex + 1,
                  totalUrls: urls.length,
                  url: url.length > 60 ? url.slice(0, 60) + "..." : url,
                  message: `Section ${urlIndex + 1}/${urls.length}: ${url.slice(0, 50)}...`,
                })
              )
            );
            const videos = await crawlBanglaChotiListing(url, {
              maxVideos: limit,
              usePuppeteer,
              onProgress: (current, total, message) => {
                globalCurrent = (urlIndex * limit) + current;
                controller.enqueue(
                  encoder.encode(ndjson({ type: "progress", current: globalCurrent, total: totalEstimate, message }))
                );
              },
            });
            for (const v of videos) {
              if (!seenIds.has(v.id)) {
                seenIds.add(v.id);
                allVideos.push(v);
              }
            }
          }

          if (useGitHub) {
            controller.enqueue(encoder.encode(ndjson({ type: "status", message: "Saving to GitHub..." })));
          } else {
            controller.enqueue(encoder.encode(ndjson({ type: "status", message: "Saving to Firestore..." })));
          }

          let inserted = 0;
          let skipped = 0;
          let updated = 0;

          if (useGitHub) {
            const { saved, total } = await saveCrawledVideosToGitHub(allVideos, { merge: true });
            inserted = saved;
            skipped = total - saved;
          } else {
            const result = await saveCrawledVideosToFirestore(allVideos, { forceUpsert });
            inserted = result.inserted;
            skipped = result.skipped;
            updated = result.updated;
          }

          let message = `${allVideos.length} ভিডিও পাওয়া গেছে। ${inserted} নতুন যোগ হয়েছে।`;
          if (updated > 0) message += ` ${updated} আপডেট হয়েছে।`;
          if (skipped > 0) message += ` ${skipped} স্কিপ (ডুপ্লিকেট)।`;
          if (allVideos.length === 0) {
            message += " কিছু ভিডিও পেজ 404 বা ব্লক করেছে।";
          } else {
            message += useGitHub ? " ভিডিওগুলো GitHub-এ সেভ হয়েছে। অ্যাপে দেখা যাবে।" : " ভিডিওগুলো এখন অ্যাপে দেখা যাবে।";
          }
          controller.enqueue(
            encoder.encode(
              ndjson({
                type: "done",
                extracted: allVideos.length,
                inserted,
                skipped,
                updated: updated ?? 0,
                message,
              })
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Crawl failed";
          controller.enqueue(encoder.encode(ndjson({ type: "error", message: msg })));
        } finally {
          controller.close();
        }
      },
    });
    return new Response(streamRes, {
      headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" },
    });
  }

  try {
    const allVideos: Awaited<ReturnType<typeof crawlBanglaChotiListing>> = [];
    const seenIds = new Set<string>();

    for (const url of urls) {
      const videos = await crawlBanglaChotiListing(url, { maxVideos: limit, usePuppeteer });
      for (const v of videos) {
        if (!seenIds.has(v.id)) {
          seenIds.add(v.id);
          allVideos.push(v);
        }
      }
    }

    let inserted = 0;
    let skipped = 0;
    let updated = 0;

    if (useGitHub) {
      const result = await saveCrawledVideosToGitHub(allVideos, { merge: true });
      inserted = result.saved;
      skipped = result.total - result.saved;
    } else {
      const result = await saveCrawledVideosToFirestore(allVideos, { forceUpsert });
      inserted = result.inserted;
      skipped = result.skipped;
      updated = result.updated;
    }

    let message = `${allVideos.length} ভিডিও পাওয়া গেছে। ${inserted} নতুন যোগ হয়েছে।`;
    if (updated > 0) message += ` ${updated} আপডেট হয়েছে।`;
    if (skipped > 0) message += ` ${skipped} স্কিপ (ডুপ্লিকেট)।`;
    if (allVideos.length === 0) {
      message += " কিছু ভিডিও পেজ 404 বা ব্লক করেছে। পরে আবার চেষ্টা করুন।";
    } else {
      message += useGitHub ? " ভিডিওগুলো GitHub-এ সেভ হয়েছে।" : " ভিডিওগুলো এখন অ্যাপে দেখা যাবে।";
    }
    return NextResponse.json({
      extracted: allVideos.length,
      inserted,
      skipped,
      updated: updated ?? 0,
      message,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Crawl failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
