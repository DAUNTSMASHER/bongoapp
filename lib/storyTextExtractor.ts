/**
 * Extracts clean story headline and body from raw crawled text.
 * Strips metadata (by author, date, stats), part numbers, and non-story content
 * (comment, subscribe, share, etc.).
 */

const HEADLINE_MAX = 80;

/** Bangla/English CTA phrases to strip from body (case-insensitive substrings) */
const CTA_PHRASES = [
  // English
  "comment below",
  "comment here",
  "subscribe",
  "subscribe to",
  "subscribe for",
  "follow us",
  "follow me",
  "follow for",
  "share this",
  "share with",
  "like this",
  "like and share",
  "like & share",
  "hit the like",
  "turn on notification",
  "turn on notifications",
  "bell icon",
  "notification bell",
  "don't forget to like",
  "don't forget to subscribe",
  "please subscribe",
  "please like",
  "please share",
  "leave a comment",
  "drop a comment",
  "tell us in the comments",
  "comment your",
  "subscribe our",
  "join our",
  "visit our",
  "check out our",
  "link in bio",
  "link in description",
  "description me",
  // Bangla
  "কমেন্ট করুন",
  "কমেন্ট কর",
  "সাবস্ক্রাইব করুন",
  "সাবস্ক্রাইব কর",
  "সাবস্ক্রাইব করতে",
  "ফলো করুন",
  "ফলো কর",
  "শেয়ার করুন",
  "শেয়ার কর",
  "লাইক করুন",
  "লাইক কর",
  "লাইক ও শেয়ার",
  "নোটিফিকেশন চালু",
  "বেল আইকন",
  "কমেন্টে লিখুন",
  "কমেন্টে জানান",
  "লাইক ভুলবেন না",
  "সাবস্ক্রাইব ভুলবেন না",
  "অবশ্যই সাবস্ক্রাইব",
  "অবশ্যই লাইক",
  "অবশ্যই শেয়ার",
  "আমাদের ফলো",
  "আমাদের চ্যানেল",
  "আমাদের পেজ",
  "ভিজিট করুন",
  "লিংক ডেসক্রিপশনে",
  "বর্ণনায় লিংক",
];

/** Section dividers / labels to strip (standalone lines, not story content) */
const SECTION_DIVIDER_PHRASES = [
  "bangla sex golpo",
  "bangla choti golpo",
  "bangla choti",
  "bengali sex story",
  "বাংলা সেক্স গল্প",
  "বাংলা চটি গল্প",
  "বাংলা চটি",
];

/** Regex: " by author_name 18-02-2026 30,9" or " by author_123 31-05-2024 86,301 anything..." */
const BY_AUTHOR_DATE_STATS =
  /\s+by\s+[\w._-]+(?:\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})?(?:\s+[\d,]+)?(?:\s+.*)?$/i;

/** Regex: Part numbers - " পার্ট ১", " পার্ট ৪", " Part 1", " – ৪", " - 4" */
const PART_NUMBER = /\s*(?:পার্ট|part)\s*[০-৯\d]+\s*|\s*[–—-]\s*[০-৯\d]+\s*$/i;

/** Regex: number-prefix suffix - " – ১.আমার জন্মকথা", " - 1.Part title" - strip numbers from headline */
const NUMBER_SUFFIX = /\s*[–—-]\s*[০-৯\d]+\.?\s*.+$/;

/** Regex: trailing date + stats " 31-05-2024 86,301" */
const DATE_STATS = /\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\s+[\d,]+(?:\s|$)/;

/** Regex: month/year title - "মাহ: মে' 2024" */
const MONTH_YEAR = /^(?:মাহ|month)\s*:\s*.+\d{2,4}$/i;

/** Check if a paragraph is CTA (comment/subscribe type) */
function isCtaParagraph(text: string): boolean {
  if (!text || text.length < 10) return false;
  const lower = text.toLowerCase().replace(/\s+/g, " ");
  for (const phrase of CTA_PHRASES) {
    if (lower.includes(phrase)) return true;
  }
  // Short lines that are mostly these words
  if (text.length < 80 && /\b(comment|subscribe|like|share|follow)\b/i.test(text)) return true;
  if (text.length < 80 && /কমেন্ট|সাবস্ক্রাইব|লাইক|শেয়ার|ফলো/.test(text)) return true;
  return false;
}

/** Check if a paragraph is a section divider (e.g. "Bangla sex golpo") - strip from body */
function isSectionDivider(text: string): boolean {
  if (!text || text.length > 50) return false;
  const lower = text.trim().toLowerCase();
  for (const phrase of SECTION_DIVIDER_PHRASES) {
    if (lower === phrase) return true;
  }
  return false;
}

/** Strip section divider from start of paragraph (e.g. "Bangla sex golpo\\nrest of para") */
function stripSectionDividerFromStart(text: string): string {
  if (!text) return text;
  let rest = text.trim();
  for (const phrase of SECTION_DIVIDER_PHRASES) {
    const re = new RegExp(`^${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n?\\s*`, "i");
    rest = rest.replace(re, "").trim();
  }
  return rest;
}

/** Remove truncated trailing text (e.g. "পাশের ফ্ল্" - cut mid-word) */
function trimTruncated(text: string): string {
  let s = text.trim();
  // If ends with very short "word" (1-3 chars) that might be truncation, drop it
  const trailing = s.match(/\s+([^\s]{1,4})$/);
  if (trailing && trailing[1].length <= 3) {
    s = s.slice(0, -trailing[0].length).trim();
  }
  return s;
}

/**
 * Extract clean headline from raw title.
 * Examples:
 * - "গৃহবধূ ঐশীর পরকীয়ার জীবন পার্ট ১ by housewife stories 18-02-2026 30,9" → "গৃহবধূ ঐশীর পরকীয়ার জীবন"
 * - "পাশের ফ্ল্যাটের আঙ্কেল – ৪ by soham_saha_ 31-05-2024 86,301 পাশের ফ্ল্" → "পাশের ফ্ল্যাটের আঙ্কেল"
 * - "স্কুল এর ম্যাডাম হয়ে কলেজ স্টুডেন্ট এর কাছে চোদা খাওয়া" → unchanged (already clean)
 */
export function extractCleanHeadline(rawTitle: string): string {
  if (!rawTitle || !rawTitle.trim()) return "";

  let t = rawTitle.trim();

  // Skip month/year style
  if (MONTH_YEAR.test(t)) return "";

  // Strip " by author date stats ..."
  t = t.replace(BY_AUTHOR_DATE_STATS, "");

  // Strip part numbers: " পার্ট ১", " – ৪"
  t = t.replace(PART_NUMBER, " ").replace(/\s+/g, " ").trim();

  // Strip number suffixes: " – ১.আমার জন্মকথা" → keep only "সিঁথির সিঁদুরে কনে"
  t = t.replace(NUMBER_SUFFIX, "").trim();

  // Strip trailing "date stats" if any
  t = t.replace(DATE_STATS, " ").trim();

  // Remove truncated trailing text
  t = trimTruncated(t);

  // Cap length
  if (t.length > HEADLINE_MAX) {
    // Try to cut at word boundary
    const cut = t.slice(0, HEADLINE_MAX);
    const lastSpace = cut.lastIndexOf(" ");
    t = lastSpace > HEADLINE_MAX / 2 ? cut.slice(0, lastSpace) : cut;
  }

  return t.trim() || rawTitle.trim().slice(0, HEADLINE_MAX);
}

/**
 * Extract story body by removing CTA paragraphs (comment, subscribe, etc.).
 * Keeps only the actual story flow.
 */
export function extractStoryBody(fullText: string): string {
  if (!fullText || !fullText.trim()) return fullText || "";

  const paragraphs = fullText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const kept: string[] = [];
  for (const p of paragraphs) {
    if (isCtaParagraph(p)) continue;
    if (isSectionDivider(p)) continue;
    const stripped = stripSectionDividerFromStart(p);
    if (stripped) kept.push(stripped);
  }

  const result = kept.join("\n\n").trim();
  return result || fullText.trim();
}

/**
 * Extract headline from first line of body when title is bad.
 * "StoryTitle by author 28-02-2025 38,838" → "StoryTitle"
 */
export function extractHeadlineFromFirstLine(firstLine: string): string | null {
  const byMatch = firstLine.match(/^(.+?)\s+by\s+\S+/i);
  if (byMatch) {
    const beforeBy = byMatch[1].trim();
    const cleaned = extractCleanHeadline(beforeBy);
    if (cleaned && cleaned.length >= 3 && cleaned.length <= HEADLINE_MAX) return cleaned;
  }
  return null;
}

/** Leading lines to strip (nav links, metadata before story) */
const LEADING_STRIP_PATTERNS = [
  /^আগের পর্ব\s*$/m,
  /^by\s+[\w._-]+\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\s+[\d,]*\s*$/im,
  /^পার্ট\s*[০-৯\d]+\s*$/m,
  /^Part\s*\d+\s*$/im,
];

/**
 * Extract only the story content from raw page body.
 * Strips: leading metadata (আগের পর্ব, by author date), Categories, Tags,
 * অনুরূপ গল্প, similar stories list, archive, footer, etc.
 */
export function extractStoryFromRawPageContent(rawContent: string): string {
  if (!rawContent || !rawContent.trim()) return rawContent || "";

  let text = rawContent.trim();

  // Remove leading metadata lines
  const lines = text.split(/\n+/);
  const kept: string[] = [];
  let started = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (started) kept.push("");
      continue;
    }
    // Skip leading nav/metadata
    let skip = false;
    if (!started) {
      for (const pat of LEADING_STRIP_PATTERNS) {
        if (pat.test(trimmed)) {
          skip = true;
          break;
        }
      }
      if (trimmed === "আগের পর্ব" || /^by\s+\S+\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/i.test(trimmed)) {
        skip = true;
      }
    }
    if (skip) continue;
    started = true;
    kept.push(trimmed);
  }

  text = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  // Remove section dividers (e.g. "Bangla sex golpo") from within story
  const paras = text.split(/\n\n+/);
  const filteredParas = paras
    .filter((p) => !isSectionDivider(p.trim()))
    .map((p) => stripSectionDividerFromStart(p.trim()))
    .filter(Boolean);
  text = filteredParas.join("\n\n").trim();

  // Also remove any remaining standalone "Bangla sex golpo" lines (regex fallback)
  text = text.replace(/\n\s*Bangla\s+sex\s+golpo\s*\n/gi, "\n\n");
  text = text.replace(/\n\s*Bangla\s+choti\s+golpo\s*\n/gi, "\n\n");
  text = text.replace(/^\s*Bangla\s+sex\s+golpo\s*\n+/i, "");
  text = text.replace(/\n+\s*Bangla\s+sex\s+golpo\s*$/i, "");
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  // Cut at earliest story-end marker
  const cutoffPhrases = [
    /(?:^|\n)\s*Categories\s/u,
    /(?:^|\n)\s*Tags\s/u,
    /অনুরূপ গল্প/u,
    /Similar stories/i,
    /গল্প লিখে পাঠান/u,
    /যোগাযোগ করুন/u,
    /©\s*\d{4}/i,
  ];
  let minIdx = text.length;
  for (const re of cutoffPhrases) {
    const m = text.match(re);
    if (m && m.index != null && m.index > 100 && m.index < minIdx) {
      minIdx = m.index;
    }
  }
  if (minIdx < text.length) {
    text = text.slice(0, minIdx).trim();
  }

  return text.trim() || rawContent.trim();
}
