/**
 * Admin API: Enhance stories with AI headlines, SEO, hashtags, and part splits.
 * POST { "storyIds"?: string[], "limit"?: 20 }
 * If storyIds omitted, processes up to limit published stories missing enhancement.
 */

import { NextResponse } from "next/server";
import type { DocumentReference } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import { enhanceStory, enhanceStorySync } from "@/lib/aiStoryEnhancer";

export const maxDuration = 300;

/** Returns true if text contains Bengali script */
function hasBengaliScript(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const storyIds = Array.isArray(body?.storyIds) ? body.storyIds : undefined;
    const limit = Math.min(Math.max(Number(body?.limit) || 20, 1), 50);
    const restoreBangla = body?.restoreBangla === true;

    const firestore = initFirestore();
    const col = firestore.collection("stories");

    let docRefs: { ref: DocumentReference; data: () => Record<string, unknown> }[];

    if (storyIds?.length) {
      const snaps = await Promise.all(storyIds.map((id: string) => col.doc(id).get()));
      docRefs = snaps
        .filter((s) => s.exists)
        .map((s) => ({ ref: s.ref, data: () => s.data()! }));
    } else {
      const snap = await col
        .where("status", "==", "published")
        .orderBy("publishedAt", "desc")
        .limit(limit * 2)
        .get();
      docRefs = snap.docs
        .filter((d) => {
          const data = d.data();
          if (restoreBangla) {
            const h = (data?.headline || data?.title || "").trim();
            return h.length > 0 && !hasBengaliScript(h);
          }
          return !data?.headline || !Array.isArray(data?.parts) || (data?.parts?.length ?? 0) < 2;
        })
        .slice(0, limit)
        .map((d) => ({ ref: d.ref, data: () => d.data() }));
    }

    let enhanced = 0;
    for (const doc of docRefs) {
      const d = doc.data();
      const title = String(d.title || "Untitled");
      const body = String(d.body || "");
      if (!body || body.length < 50) continue;

      const result = restoreBangla
        ? enhanceStorySync(title, body)
        : await enhanceStory(title, body, d.summary as string | undefined);
      await doc.ref.update({
        headline: result.headline,
        seoTitle: result.seoTitle,
        seoDescription: result.seoDescription,
        hashtags: result.hashtags,
        parts: result.parts,
        updatedAt: FieldValue.serverTimestamp(),
      });
      enhanced++;
    }

    return NextResponse.json({
      processed: docRefs.length,
      enhanced,
      message: restoreBangla
        ? `${enhanced} গল্প বাংলা হেডলাইনে পুনরুদ্ধার হয়েছে`
        : `${enhanced} গল্প উন্নত হয়েছে (হেডলাইন, SEO, হ্যাশট্যাগ, পার্ট)`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Enhance failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
