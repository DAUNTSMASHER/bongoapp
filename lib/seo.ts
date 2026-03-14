/**
 * SEO helpers — consistent metadata for search snippets (headline, link, description).
 * Google shows: title (50–60 chars), URL, description (150–160 chars).
 */
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export function getSiteUrl() {
  return siteUrl.replace(/\/$/, "");
}

export function getLogoUrl() {
  return `${getSiteUrl()}/logo.png`;
}

/** Strip HTML and limit length for meta description. */
export function cleanDescription(text: string, maxLen = 160): string {
  if (!text) return "";
  const stripped = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen - 1).trim().replace(/\s+\S*$/, "") + "…";
}

/** Get short excerpt for UI: first sentence or ~maxChars. Reduces avg sentence length & duplication. */
export function shortExcerpt(text: string, maxChars = 100): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  const first = cleaned.split(/[।.!?]\s+/)[0]?.trim();
  if (!first) return cleaned.slice(0, maxChars).trim() + (cleaned.length > maxChars ? "…" : "");
  const end = cleaned.includes("।") ? "।" : ".";
  if (first.length <= maxChars) return first + end;
  return first.slice(0, maxChars - 1).trim().replace(/\s+\S*$/, "") + "…";
}

/** Brief excerpt for cards: maxWords to keep avg sentence length low (SEO readability). */
export function briefExcerpt(text: string, maxWords = 15): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return cleaned;
  return words.slice(0, maxWords).join(" ") + "…";
}

/** Default OG image for pages without a custom image. */
export function defaultOgImage(alt: string) {
  return { url: getLogoUrl(), width: 512, height: 512, alt };
}
