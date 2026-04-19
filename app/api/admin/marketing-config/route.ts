import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

/**
 * POST /api/admin/marketing-config
 * Save Telegram Bot config to Firestore so cron jobs can use it.
 *
 * GET /api/admin/marketing-config
 * Read the current config.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const doc = await db.collection("config").doc("marketing").get();
    if (!doc.exists) {
      return NextResponse.json({ telegramBotToken: "", telegramChatId: "", autoPostEnabled: false });
    }
    const data = doc.data()!;
    return NextResponse.json({
      telegramBotToken: data.telegramBotToken ? "••••configured" : "",
      telegramChatId: data.telegramChatId || "",
      autoPostEnabled: data.autoPostEnabled || false,
      googleConnected: !!data.googleRefreshToken,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    await db.collection("config").doc("marketing").set(
      {
        telegramBotToken: body.telegramBotToken || "",
        telegramChatId: body.telegramChatId || "",
        autoPostEnabled: body.autoPostEnabled ?? false,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
