/**
 * ML/rule-based classification: Is this a real story or junk (e.g. month/year, archive label)?
 */

/** Bangla month names (common spellings) */
const BANGLA_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  "জানুয়ারী", "ফেব্রুয়ারী", "চৈত্র", "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়",
  "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন",
];

/** English month names */
const EN_MONTHS = ["january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Regex: YYYY, YY, month YYYY, month-year, etc. */
const DATE_PATTERNS = [
  /^\d{4}$/,                                    // 2024, 2025
  /^\d{2}$/,                                    // 24, 25
  /^(জানু|ফেব্রু|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্ট|অক্টো|নভে|ডিসে)[^\d]*\s*\d{2,4}/i,
  /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^\d]*\s*\d{2,4}/i,
  /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/,          // 01-03-2025
  /^archive\s*:?\s*\d{4}/i,
  /^\d{4}\s*[-–]\s*(জানু|ফেব্রু|মার্চ|মে|জুন|জুলাই|আগস্ট|সেপ্ট|অক্টো|নভে|ডিসে)/i,
];

export interface ClassificationResult {
  isStory: boolean;
  reason: string;
  confidence: number; // 0-1
}

/**
 * Classify: Is this a real story or junk (date, archive label, etc.)?
 */
export function classifyStory(title: string, body: string): ClassificationResult {
  const t = title.trim();
  const b = (body || "").trim();

  // Too short
  if (b.length < 80) {
    return { isStory: false, reason: "Body too short (< 80 chars)", confidence: 0.95 };
  }

  // Title looks like date only
  const titleLower = t.toLowerCase();
  for (const pat of DATE_PATTERNS) {
    if (pat.test(t.trim())) {
      return { isStory: false, reason: `Title matches date pattern: "${t}"`, confidence: 0.9 };
    }
  }

  // Title is just month + year (Bangla or English)
  const monthYearMatch = t.match(
    /^((?:জানু|ফেব্রু|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^\d]*)\s*['\-\s]?\s*(\d{2,4})$/i
  );
  if (monthYearMatch) {
    return { isStory: false, reason: `Title is month-year: "${t}"`, confidence: 0.95 };
  }

  // Title is very short and numeric
  if (t.length <= 15 && /^\d+/.test(t)) {
    return { isStory: false, reason: `Title is numeric/short: "${t}"`, confidence: 0.7 };
  }

  // Body is mostly digits/dates
  const bodyLetters = b.replace(/\d/g, "").replace(/\s/g, "").length;
  if (bodyLetters < 50) {
    return { isStory: false, reason: "Body has too few letters (mostly numbers)", confidence: 0.85 };
  }

  // Title contains "archive" or "সূচিপত্র" (index)
  if (/archive|সূচিপত্র|index|সূচী/i.test(t)) {
    return { isStory: false, reason: `Title is archive/index: "${t}"`, confidence: 0.9 };
  }

  // "মাহ: ফেব্ৰুৱাৰী 2025" (Month: February 2025) - only hide if body is short (archive list)
  if ((/^মাহ\s*:\s*.+\d{4}/i.test(t) || /^month\s*:\s*.+\d{4}/i.test(t)) && b.length < 400) {
    return { isStory: false, reason: `Title is month/year, body short: "${t}"`, confidence: 0.9 };
  }

  return { isStory: true, reason: "Passes story checks", confidence: 0.85 };
}
