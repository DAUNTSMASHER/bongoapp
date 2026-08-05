/**
 * Admin API: fetch custom analytics (daily page views, clicks).
 * GET /api/admin/analytics?days=30
 * Returns { daily: [{ date, pageViews, clicks }], totals: { pageViews, clicks } }
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Math.min(90, Math.max(7, parseInt(searchParams.get("days") || "30", 10)));

    const firestore = initFirestore();
    const col = firestore.collection("analytics").doc("daily").collection("byDate");
    const snapshot = await col.get();

    const byDate = new Map<string, { pageViews: number; clicks: number }>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      byDate.set(doc.id, {
        pageViews: typeof data.pageViews === "number" ? data.pageViews : 0,
        clicks: typeof data.clicks === "number" ? data.clicks : 0,
      });
    });

    const now = new Date();
    const tz = process.env.TZ || "Asia/Dhaka";
    const daily: { date: string; pageViews: number; clicks: number }[] = [];
    let totalPageViews = 0;
    let totalClicks = 0;

    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA", { timeZone: tz });
      const row = byDate.get(dateStr) || { pageViews: 0, clicks: 0 };
      daily.push({ date: dateStr, pageViews: row.pageViews, clicks: row.clicks });
      totalPageViews += row.pageViews;
      totalClicks += row.clicks;
    }

    daily.reverse();

    return NextResponse.json({
      daily,
      totals: { pageViews: totalPageViews, clicks: totalClicks },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
