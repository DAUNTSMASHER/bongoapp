/**
 * Replaces person names and area/place names with Bangladesh equivalents.
 * Applied after crawling, before saving to Firestore.
 */

/** Indian/Western names → Bangladesh names */
const NAME_MAP: [string, string][] = [
  ["রাহুল", "রাকিব"],
  ["রাজ", "রাজিব"],
  ["রাজু", "রাজু"],
  ["সুনিল", "সাজিদ"],
  ["বিকাশ", "বিকাশ"],
  ["অরুণ", "অর্ণব"],
  ["মোহন", "মাহমুদ"],
  ["রমেশ", "রহিম"],
  ["প্রিয়াঙ্কা", "প্রিয়াঙ্কা"],
  ["সোনিয়া", "সোনিয়া"],
  ["কবিতা", "কবিতা"],
  ["অঞ্জলি", "অনন্যা"],
  ["রেখা", "রেখা"],
  ["সীমা", "সীমা"],
  ["পূজা", "পূজা"],
  ["দীপিকা", "দিপা"],
  ["আনিতা", "আনিকা"],
  ["কবীর", "করিম"],
  ["বলরাম", "বদরুল"],
  ["গোপাল", "গোলাম"],
  ["রাম", "রহমান"],
  ["শ্যাম", "শাহীন"],
  ["রাজেশ", "রাজু"],
  ["মনোজ", "মনির"],
  ["সুরেশ", "সোহেল"],
  ["বিনোদ", "বিনয়"],
  ["কুমার", "কামাল"],
  ["সন্তোষ", "সন্তোষ"],
  ["রাজীব", "রাজু"],
  ["অমিত", "আমিন"],
  ["বিশাল", "বিশাল"],
  ["নীল", "নীল"],
  ["আদিত্য", "আদনান"],
  ["অভয়", "অভি"],
  ["রজনী", "রাজা"],
  ["দেব", "দীপন"],
  ["অনিল", "আনিস"],
  ["বিক্রম", "বিক্রম"],
  ["ঋত্বিক", "রিফাত"],
  ["আকাশ", "আকাশ"],
];

/** Indian/Western places → Bangladesh places */
const PLACE_MAP: [string, string][] = [
  ["মুম্বাই", "ঢাকা"],
  ["মুম্বই", "ঢাকা"],
  ["দিল্লি", "ঢাকা"],
  ["কলকাতা", "চট্টগ্রাম"],
  ["বাংলোর", "সিলেট"],
  ["বেঙ্গালুরু", "সিলেট"],
  ["হায়দ্রাবাদ", "খুলনা"],
  ["চেন্নাই", "কুমিল্লা"],
  ["পুনে", "রাজশাহী"],
  ["যোধপুর", "ময়মনসিংহ"],
  ["জয়পুর", "বরিশাল"],
  ["লখনউ", "সিলেট"],
  ["কানপুর", "কুমিল্লা"],
  ["ইন্দোর", "চট্টগ্রাম"],
  ["ভোপাল", "খুলনা"],
  ["পাটনা", "রাজশাহী"],
  ["রাঁচি", "সিলেট"],
  ["গুজরাট", "চট্টগ্রাম"],
  ["মহারাষ্ট্র", "ঢাকা"],
  ["উত্তরপ্রদেশ", "ঢাকা বিভাগ"],
  ["রাজস্থান", "রাজশাহী"],
  ["পশ্চিমবঙ্গ", "খুলনা বিভাগ"],
  ["বিহার", "রাজশাহী"],
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replaces names and places in text with Bangladesh equivalents.
 */
export function replaceWithBangladeshNames(text: string): string {
  let out = text;
  for (const [from, to] of NAME_MAP) {
    const re = new RegExp(escapeRegex(from), "g");
    out = out.replace(re, to);
  }
  for (const [from, to] of PLACE_MAP) {
    const re = new RegExp(escapeRegex(from), "g");
    out = out.replace(re, to);
  }
  return out;
}

/**
 * Applies Bangladesh name/place replacement to a CrawledStory.
 */
export function transformStoryForBangladesh<T extends { title: string; body: string; summary: string }>(
  story: T
): T {
  return {
    ...story,
    title: replaceWithBangladeshNames(story.title),
    body: replaceWithBangladeshNames(story.body),
    summary: replaceWithBangladeshNames(story.summary),
  };
}
