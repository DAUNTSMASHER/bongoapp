import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/marketing-config
 * Save Telegram Bot config to Firestore so cron jobs can use it.
 *
 * GET /api/admin/marketing-config
 * Read the current config.
 */

async function getFirestore() {
  const admin = await import("firebase-admin");
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
  return admin.firestore();
}

export async function GET() {
  try {
    const db = await getFirestore();
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
    const db = await getFirestore();

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
