/**
 * ML-inspired story processor: character extraction, erotic tag extraction,
 * block splitting, and deterministic storyId for deduplication.
 * Uses rule-based heuristics (decision-tree-like) with probabilistic scoring.
 */

import { extractStoryBody, extractStoryFromRawPageContent } from "./storyTextExtractor";

/** Extracted story metadata from ML processing */
export interface ProcessedStoryData {
  headline: string;
  body: string;
  bodyCharCount: number;
  blocks: string[];
  blockCount: number;
  characterNames: string[];
  characterCount: number;
  eroticTags: string[];
  storyId: string;
}

/** Bangla erotic/sensual words for tag extraction (sample - extend as needed) */
const EROTIC_BANGLA_WORDS = [
  "চুমু", "ঠোঁট", "উত্তেজনা", "বাঁড়া", "ধোন", "গুদ", "পোদ", "ভোদা", "ভোদার",
  "চোদা", "চুদা", "চোদন", "চুদাচুদি", "চোদাচুদি", "ঠাপ", "ঠাপানো", "মাই", "দুধ",
  "তৃপ্তি", "রস", "বীর্য", "ফ্যাদা", "মাল", "জাঙ্গিয়া", "প্যান্ট", "গুদে", "পোদে",
  "চুষ", "চুষতে", "চাট", "চাটতে", "টিপ", "টিপতে", "খামচে", "কামুক", "কামাসক্ত",
  "উঃ", "আঃ", "উম", "ওফ", "আহ", "আহা", "ওহ", "উম্ম", "আঃ আঃ", "উঃ উঃ",
  "বিছানা", "শয্যা", "আলিঙ্গন", "কোল", "স্পর্শ", "সুখ", "আরাম", "রোমাঞ্চ",
  "গুদ মারা", "ঠাপ দিলাম", "চুদলাম", "চোদলাম", "গুদের", "পোদের",
  "পরকিয়া", "অজাচার", "পারিবারিক", "থ্রীসাম", "অর্গি", "সেক্স",
  "বিডিএসএম", "চোদাচুদির", "গল্প", "পানু", "স্টোরি",
];

/** Moaning/sound patterns (regex) */
const MOAN_PATTERNS = [
  /উঃ+\s*আঃ+/g,
  /আঃ+\s*উঃ+/g,
  /উম+\s*উম+/g,
  /ওফ+\s*দারুন/g,
  /আহ+\s*আহ+/g,
  /[উআও]+\s*[উআও]+/g,
];

/** Non-name words to exclude (common Bangla/English) */
const NAME_BLACKLIST = new Set([
  "এসব", "সব", "কিছু", "কেউ", "এটা", "ওটা", "এই", "যে", "যেমন", "তাই", "না", "হ্যাঁ",
  "কী", "কি", "কেন", "কেমন", "কে", "কখন", "কোথায়", "এখানে", "সেখানে", "আজ", "কাল",
  "এখন", "তবু", "তবে", "কিন্তু", "আর", "অথচ", "যদি", "যখন", "যেন", "তাইলে", "উন",
  "ওকে", "আমি", "তুমি", "সে", "ও", "তিনি", "আমরা", "তারা", "একটা", "একটি",
  "by", "said", "the", "this", "that",
]);

/** Character name patterns - "আমার নাম X", "X বলল", "X ভাবল", "X আন্টি", etc. */
const CHAR_PATTERNS = [
  /আমার নাম\s+([^\s।,]+)/g,
  /নাম\s+([^\s।,]+)\s*[।.]/g,
  /^([অ-হa-zA-Z]{2,20})\s+বলল/gm,
  /^([অ-হa-zA-Z]{2,20})\s+বললো/gm,
  /^([অ-হa-zA-Z]{2,20})\s+ভাবল/gm,
  /^([অ-হa-zA-Z]{2,20})\s+জিজ্ঞাসা করল/gm,
  /^([অ-হa-zA-Z]{2,20})\s+উঠে/gm,
  /\b([অ-হ]{2,20})\s+আন্টি\b/g,
  /\b([অ-হ]{2,20})\s+স্যার\b/g,
  /\b([অ-হ]{2,20})\s+মামা\b/g,
  /\b([অ-হ]{2,20})\s+মামী\b/g,
  /\b([অ-হ]{2,20})\s+ফুপী\b/g,
  /\b([অ-হ]{2,20})\s+দিদি\b/g,
  /\b([অ-হ]{2,20})\s+ভাই\b/g,
  /(?:^|\s)—\s*[""]?([অ-হa-zA-Z]{2,20})\s+বল/gm,
  /\b([অ-হa-zA-Z]{2,15})এর\b/g,
  /\b([অ-হa-zA-Z]{2,15})কে\s/g,
  /\b([অ-হa-zA-Z]{2,15})\s+ভাবলো/gm,
  /by\s+([\w._-]+)/gi,
  /\|\s*([অ-হ\w]+)\s*\|/g,
];

/** Minimum block length (chars) to count as valid */
const MIN_BLOCK_CHARS = 30;

/** Block body into paragraphs (split on double newline) */
export function splitIntoBlocks(body: string): string[] {
  const cleaned = extractStoryBody(body);
  const raw = cleaned.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const blocks: string[] = [];
  for (const p of raw) {
    if (p.length >= MIN_BLOCK_CHARS) blocks.push(p);
  }
  return blocks.length >= 1 ? blocks : [cleaned].filter(Boolean);
}

/** Extract character names from body using heuristic patterns (decision-tree style) */
export function extractCharacterNames(body: string, headline?: string): string[] {
  const text = `${headline || ""} ${body}`;
  const seen = new Set<string>();
  const names: string[] = [];

  for (const re of CHAR_PATTERNS) {
    let m: RegExpExecArray | null;
    const regex = new RegExp(re.source, re.flags);
    while ((m = regex.exec(text)) !== null) {
      let name = m[1].trim();
      if (!name || name.length < 2 || name.length > 25) continue;
      name = name.replace(/^["'\(\[]|["'\)\]]$/g, "").trim();
      if (/^[\d_]+$/.test(name) || /^(by|said|the)$/i.test(name)) continue;
      if (NAME_BLACKLIST.has(name)) continue;
      if (/^[অ-হ]+$/.test(name) || /^[a-zA-Z]+$/.test(name)) {
        const key = name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          names.push(name);
        }
      }
    }
  }

  return names;
}

/** Extract erotic/sensual tags from body */
export function extractEroticTags(body: string): string[] {
  const tags: Set<string> = new Set();
  const lower = body.toLowerCase();

  for (const word of EROTIC_BANGLA_WORDS) {
    if (lower.includes(word)) tags.add(word);
  }

  for (const re of MOAN_PATTERNS) {
    const matches = body.match(re);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.trim().slice(0, 20);
        if (cleaned) tags.add(cleaned);
      }
    }
  }

  return Array.from(tags);
}

/**
 * Generate deterministic storyId for deduplication.
 * Format: {charCount}{sortedCharacterNames}story
 * e.g. 04রতনসুমিরত্না হালদারফটিক স্যারstory
 */
export function generateStoryId(characterCount: number, characterNames: string[]): string {
  const sorted = [...characterNames].sort((a, b) => a.localeCompare(b));
  const namesPart = sorted.join("").replace(/\s+/g, "");
  const countStr = String(characterCount).padStart(2, "0");
  return `${countStr}${namesPart}story`;
}

/**
 * Full ML-style processing: extract blocks, characters, erotic tags, storyId.
 */
export function processStoryContent(
  rawBody: string,
  headline: string
): ProcessedStoryData {
  const body = extractStoryFromRawPageContent(rawBody);
  const cleanBody = extractStoryBody(body);
  const blocks = splitIntoBlocks(cleanBody);
  const characterNames = extractCharacterNames(cleanBody, headline);
  const characterCount = Math.max(characterNames.length, 1);
  const eroticTags = extractEroticTags(cleanBody);

  const storyId = generateStoryId(characterCount, characterNames);

  return {
    headline: headline.trim(),
    body: cleanBody,
    bodyCharCount: cleanBody.length,
    blocks,
    blockCount: blocks.length,
    characterNames,
    characterCount,
    eroticTags,
    storyId,
  };
}
