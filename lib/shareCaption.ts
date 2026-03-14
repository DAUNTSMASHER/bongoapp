/**
 * Extract caption for social share — first X% of content words.
 */

export const CAPTION_PERCENT_OPTIONS = [20, 50, 75, 100] as const;

/** Split text into words (handles Bangla, English, spaces) */
function getWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

/**
 * Get first `percent`% of words from body as caption.
 * @param body - Story body text
 * @param percent - 20, 50, 75, or 100
 * @param maxChars - Optional max length (Facebook post ~63k, but 1000 is readable)
 */
export function getShareCaption(
  body: string,
  percent: number,
  maxChars = 2000
): string {
  const words = getWords(body || "");
  if (words.length === 0) return "";
  const count = Math.max(1, Math.ceil((words.length * percent) / 100));
  const selected = words.slice(0, count).join(" ");
  return selected.length > maxChars ? selected.slice(0, maxChars) + "…" : selected;
}
