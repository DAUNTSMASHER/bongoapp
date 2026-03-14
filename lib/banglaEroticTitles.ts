/**
 * Bangla erotic video title templates. Uses deterministic seed for consistent titles per video.
 */

const FEMALE_NAMES = [
  "অনিতা",
  "পূজা",
  "প্রিয়া",
  "রিয়া",
  "সুমি",
  "টিনা",
  "তানিয়া",
  "রিনা",
  "দীপা",
  "নিশি",
  "নিমা",
  "মালা",
  "সোনালি",
  "কুসুম",
  "মাধবি",
  "রেখা",
  "শিলা",
  "জয়া",
  "লতা",
  "নাজমা",
  "শাহিনা",
  "অঞ্জলি",
  "কবিতা",
];

const MALE_NAMES = [
  "রাজু",
  "রাকিব",
  "সুমন",
  "সাজিদ",
  "রাহুল",
  "করিম",
  "কবির",
  "সাগর",
  "রতন",
  "বিশু",
];

type TemplateFn = (f: string, m: string) => string;

const TEMPLATES: TemplateFn[] = [
  (f, m) => `${f} ও ${m} — গোপন মুহূর্ত`,
  (f) => `${f} বৌদির রাত — Bangla`,
  (f, m) => `${f} এবং ${m} — প্রেমের ভিডিও`,
  (f) => `গ্রামের ${f} — Viral MMS`,
  (f) => `${f} দিদির গোপন ভিডিও`,
  (f, m) => `${f} ও ${m} — প্রথম রাত`,
  (f) => `${f} ম্যাডাম — অফিসের পর`,
  (f, m) => `${m} ও ${f} — লুকানো ক্যামেরা`,
  (f) => `${f} বৌদি — শ্বশুরবাড়িতে`,
  (f, m) => `${f} আন্টি ও ${m} — গৃহকর্মী`,
  (f) => `${f} — কলেজের বন্ধুর সাথে`,
  (f, m) => `${f} ও ${m} ভাই — বাসায় একা`,
  (f) => `${f} — বাঙালি মেয়ের ভিডিও`,
  (f, m) => `${f} দিদি ও ${m} দাদু`,
  (f) => `${f} — মেসের পাশের রুম`,
  (f, m) => `${f} এবং ${m} — হোটেল রুম`,
  (f) => `${f} — প্রেমিকের সাথে প্রথম`,
  (f, m) => `${f} কাকিমা ও ${m} — বাড়িতে একা`,
  (f) => `${f} — Dhaka Viral`,
  (f, m) => `${f} বোন ও ${m} ভাই — রাতের বেলা`,
];

/** Simple deterministic hash from string to number */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Generate a deterministic Bangla erotic title from a seed (e.g. video filename).
 */
export function generateEroticTitle(seed: string): string {
  const h = hash(seed);
  const templateIdx = h % TEMPLATES.length;
  const femaleIdx = (h >> 2) % FEMALE_NAMES.length;
  const maleIdx = (h >> 5) % MALE_NAMES.length;
  const f = FEMALE_NAMES[femaleIdx];
  const m = MALE_NAMES[maleIdx];
  const fn = TEMPLATES[templateIdx];
  return fn(f, m);
}
