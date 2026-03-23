import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/auto-distribute
 * Vercel Cron Job — runs daily.
 * 1. Reads marketing config from Firestore
 * 2. Finds stories not yet distributed
 * 3. Sends them to Telegram
 * 4. Pings Google sitemap
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.bongochoti.com";

async function getFirebaseAdmin() {
  const admin = await import("firebase-admin");
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
  return admin;
}

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow if no CRON_SECRET is set (for development)
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(`[auto-distribute] ${msg}`);
    logs.push(msg);
  };

  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    // 1. Read marketing config
    const configDoc = await db.collection("config").doc("marketing").get();
    if (!configDoc.exists) {
      log("No marketing config found. Skipping.");
      return NextResponse.json({ ok: true, logs, distributed: 0 });
    }

    const config = configDoc.data()!;
    if (!config.autoPostEnabled) {
      log("Auto-post is disabled. Skipping.");
      return NextResponse.json({ ok: true, logs, distributed: 0 });
    }

    const botToken = config.telegramBotToken;
    const chatId = config.telegramChatId;

    if (!botToken || !chatId) {
      log("Telegram bot token or chat ID not configured. Skipping.");
      return NextResponse.json({ ok: true, logs, distributed: 0 });
    }

    // 2. Find stories created in the last 24 hours that haven't been distributed
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const storiesSnapshot = await db
      .collection("stories")
      .where("status", "==", "published")
      .where("createdAt", ">=", oneDayAgo)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    if (storiesSnapshot.empty) {
      log("No new stories in the last 24 hours.");
    } else {
      log(`Found ${storiesSnapshot.size} recent stories.`);

      for (const storyDoc of storiesSnapshot.docs) {
        const story = storyDoc.data();
        const storyId = storyDoc.id;

        // Check if already distributed
        const distRef = db.collection("distributions").doc(storyId);
        const distDoc = await distRef.get();
        if (distDoc.exists) {
          log(`Already distributed: "${story.title}" — skipping`);
          continue;
        }

        // Send to Telegram
        const storyUrl = `${SITE_URL}/stories/${storyId}`;
        const caption = [
          `📖 *${escapeMarkdown(story.title || "New Story")}*`,
          story.body ? `\n${escapeMarkdown(String(story.body).slice(0, 200))}…` : "",
          `\n🔗 [পড়ুন এখানে](${storyUrl})`,
        ]
          .filter(Boolean)
          .join("");

        const telegramMethod = story.coverImageUrl ? "sendPhoto" : "sendMessage";
        const telegramBody = story.coverImageUrl
          ? { chat_id: chatId, photo: story.coverImageUrl, caption, parse_mode: "MarkdownV2" }
          : { chat_id: chatId, text: caption, parse_mode: "MarkdownV2" };

        try {
          const res = await fetch(`https://api.telegram.org/bot${botToken}/${telegramMethod}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(telegramBody),
          });
          const data = await res.json();

          if (data.ok) {
            log(`✅ Sent to Telegram: "${story.title}"`);
            // Mark as distributed
            await distRef.set({
              storyId,
              title: story.title,
              telegramMessageId: data.result?.message_id,
              distributedAt: new Date().toISOString(),
              channels: ["telegram"],
            });
          } else {
            log(`❌ Telegram error for "${story.title}": ${data.description}`);
          }
        } catch (err) {
          log(`❌ Failed to send "${story.title}": ${err}`);
        }

        // Rate limit: wait 1.5s between messages
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    // 3. Ping Google sitemap
    try {
      const sitemapUrl = `${SITE_URL}/sitemap.xml`;
      const pingRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      log(`🔔 Google sitemap ping: ${pingRes.status}`);
    } catch (err) {
      log(`❌ Google ping failed: ${err}`);
    }

    return NextResponse.json({ ok: true, logs, distributed: storiesSnapshot?.size || 0 });
  } catch (err) {
    log(`Fatal error: ${err}`);
    return NextResponse.json({ ok: false, error: String(err), logs }, { status: 500 });
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}
