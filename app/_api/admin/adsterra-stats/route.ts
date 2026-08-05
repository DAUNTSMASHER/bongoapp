import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ADSTERRA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const url = `https://api3.adsterratools.com/publisher/stats.json?group_by=placement&start_date=${today}&finish_date=${today}`;

    const response = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "Adsterra API Error", details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Adsterra Stats Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
