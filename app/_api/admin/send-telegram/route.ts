import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/send-telegram
 * Sends a story to a Telegram channel via Bot API.
 * Body: { botToken, chatId, title, url, coverImageUrl?, description? }
 */
export async function POST(req: NextRequest) {
  try {
    const { botToken, chatId, title, url, coverImageUrl, description } = await req.json();

    if (!botToken || !chatId || !title || !url) {
      return NextResponse.json(
        { error: "botToken, chatId, title, and url are required" },
        { status: 400 }
      );
    }

    // Build caption
    const caption = [
      `📖 *${escapeMarkdown(title)}*`,
      description ? `\n${escapeMarkdown(description.slice(0, 200))}…` : "",
      `\n🔗 [পড়ুন এখানে](${url})`,
      `\n📱 @bongochoti\\_golpo`,
    ]
      .filter(Boolean)
      .join("");

    let result;

    // If cover image exists, send as photo with caption
    if (coverImageUrl) {
      result = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            photo: coverImageUrl,
            caption,
            parse_mode: "MarkdownV2",
          }),
        }
      );
    } else {
      // Send as text message
      result = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: caption,
            parse_mode: "MarkdownV2",
          }),
        }
      );
    }

    const data = await result.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: data.description || "Telegram API error" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, messageId: data.result?.message_id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}
