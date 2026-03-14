/**
 * Adsterra stats API — requires ADSTERRA_API_TOKEN.
 * GET /api/admin/adsterra-stats?domain_id=...&start=YYYY-MM-DD&finish=YYYY-MM-DD
 */

import { NextResponse } from "next/server";
import { getStats, getDomains } from "@/lib/adsterraApi";

export async function GET(request: Request) {
  const token = process.env.ADSTERRA_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "ADSTERRA_API_TOKEN not set. Add to .env from Adsterra dashboard." },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("domain_id");
    const start = searchParams.get("start");
    const finish = searchParams.get("finish");

    if (searchParams.get("domains") === "1") {
      const domains = await getDomains();
      return NextResponse.json({ domains });
    }

    const stats = await getStats({
      domain_id: domainId ? parseInt(domainId, 10) : undefined,
      start: start || undefined,
      finish: finish || undefined,
    });
    return NextResponse.json({ stats });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Adsterra API error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
