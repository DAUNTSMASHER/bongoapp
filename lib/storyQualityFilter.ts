/**
 * Story quality filter: ensures extracted stories have proper storytelling
 * and endings (not CTA-heavy, minimum length, narrative structure).
 */

/** CTA phrases that indicate a story ends with call-to-action (reject) */
const CTA_ENDING_PHRASES = [
  "leave a comment",
  "drop a comment",
  "comment below",
  "comment here",
  "comment করুন",
  "comment কর",
  "সাবস্ক্রাইব করুন",
  "সাবস্ক্রাইব কর",
  "subscribe",
  "subscribe to",
  "লাইক করুন",
  "লাইক কর",
  "like and share",
  "লাইক ও শেয়ার",
  "follow us",
  "ফলো করুন",
  "কমেন্টে লিখুন",
  "কমেন্টে জানান",
  "read more",
  "আরও পড়ুন",
  "পরবর্তী পর্ব",
  "next part",
  "share this",
  "শেয়ার করুন",
];

/** Phrases that suggest a narrative ending (positive signal) */
const NARRATIVE_ENDING_PATTERNS = [
  /।\s*$/,
  /\.\s*$/,
  /\?\s*$/,
  /।\s*$/u,
  /সমাপ্ত\s*\.?\s*$/i,
  /শেষ\s*\.?\s*$/i,
  /কাহিনী\s*সমাপ্ত/i,
  /গল্প\s*সমাপ্ত/i,
  /থাকবে\s*[।.]?\s*$/,
  /হবে\s*[।.]?\s*$/,
  /গেল[োো]\s*[।.]?\s*$/,
  /থাকল[োো]\s*[।.]?\s*$/,
];

export interface StoryQualityOptions {
  minBodyLength?: number;
  minParagraphs?: number;
  rejectCtaEnding?: boolean;
  requireNarrativeEnding?: boolean;
}

export interface StoryQualityResult {
  passes: boolean;
  reason: string;
}

const DEFAULT_OPTIONS: Required<StoryQualityOptions> = {
  minBodyLength: 1000,
  minParagraphs: 3,
  rejectCtaEnding: true,
  requireNarrativeEnding: false,
};

/**
 * Check if story body passes quality requirements:
 * - Minimum length
 * - Minimum paragraphs (narrative structure)
 * - Does not end with CTA
 * - Optionally: ends with narrative (sentence-ending punctuation)
 */
export function passesStoryQuality(
  body: string,
  options: StoryQualityOptions = {}
): StoryQualityResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const trimmed = (body || "").trim();

  if (trimmed.length < opts.minBodyLength) {
    return {
      passes: false,
      reason: `Body too short (${trimmed.length} < ${opts.minBodyLength} chars)`,
    };
  }

  const paragraphs = trimmed.split(/\n\n+/).filter((p) => p.trim().length > 20);
  if (paragraphs.length < opts.minParagraphs) {
    return {
      passes: false,
      reason: `Too few paragraphs (${paragraphs.length} < ${opts.minParagraphs})`,
    };
  }

  if (opts.rejectCtaEnding) {
    const lastPara = paragraphs[paragraphs.length - 1]?.trim().toLowerCase() || "";
    const last100 = trimmed.slice(-150).toLowerCase();

    for (const phrase of CTA_ENDING_PHRASES) {
      if (lastPara.includes(phrase) || last100.includes(phrase)) {
        return {
          passes: false,
          reason: `Ends with CTA: "${phrase}"`,
        };
      }
    }
  }

  if (opts.requireNarrativeEnding) {
    const lastPara = paragraphs[paragraphs.length - 1]?.trim() || "";
    const endsWithNarrative = NARRATIVE_ENDING_PATTERNS.some((re) => re.test(lastPara));
    if (!endsWithNarrative && lastPara.length > 50) {
      return {
        passes: false,
        reason: "Does not end with narrative conclusion",
      };
    }
  }

  return { passes: true, reason: "Passes quality checks" };
}
