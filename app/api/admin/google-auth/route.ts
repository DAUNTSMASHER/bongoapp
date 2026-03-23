import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleAuth";

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Google Auth error:", err);
    return NextResponse.json({ error: "OAuth configuration missing" }, { status: 500 });
  }
}
