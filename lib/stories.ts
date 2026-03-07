import type { Story } from "@/types/story";

// Mock data for development until Firestore is connected
export const MOCK_STORIES: Story[] = [
  {
    id: "1",
    title: "বৃষ্টির দিন",
    slug: "brishter-din",
    body: "বৃষ্টির দিনে জানালার পাশে বসে থাকা এক পরম সুখ। ধারাপাত পড়তে পড়তে চায়ে চুমুক দেওয়া। বাইরে ঝরঝর করে বৃষ্টি পড়ছে। ঘরে গরম ভাত আর আলুর ভর্তা।\n\nসেদিনও এমনই একটা দিন ছিল। দিদি বাড়ি ছিল। ওর সঙ্গে খেলা করেছি সারাদিন। সন্ধ্যায় মা বললেন—চলো, এবার পড়াশোনা।\n\nআজও বৃষ্টি আসছে। কিন্তু দিদি নেই। দিদি চলে গেছে অনেক দূরে। শুধু স্মৃতি আর এই বৃষ্টির দিন।",
    summary: "বৃষ্টির দিনের স্মৃতিচারণ।",
    tags: ["ছোট", "নস্টালজিয়া"],
    categorySlug: "sera",
    language: "bn",
    lengthType: "short",
    status: "published",
    popularityScore: 100,
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date("2026-02-15"),
    publishedAt: new Date("2026-02-15"),
  },
  {
    id: "2",
    title: "নতুন শুরু",
    slug: "notun-shuru",
    body: "কলকাতা থেকে ঢাকায় এসে জীবনে নতুন অধ্যায়ের সূচনা। বিদেশে পড়তে আসার প্রথম রাত। হোস্টেলের খাটে শুয়ে ভাবছিলাম—কত কিছুই তো বদলে যাবে।\n\nপরের দিন সকালে ঘুম ভাঙল অন্যরকম এক স্বাদে। বাইরে সবুজ। পাখির ডাক। জানল দিয়ে দেখলাম—একটা নতুন শহর আমাকে জড়িয়ে নিচ্ছে ধীরে ধীরে।",
    summary: "বিদেশে নতুন জীবন।",
    tags: ["মাঝারি", "জীবনগাথা"],
    categorySlug: "students",
    language: "bn",
    lengthType: "medium",
    status: "published",
    popularityScore: 80,
    createdAt: new Date("2025-11-20"),
    updatedAt: new Date("2025-11-20"),
    publishedAt: new Date("2025-11-20"),
  },
  {
    id: "3",
    title: "মায়ের হাতের রান্না",
    slug: "mayer-hather-ranna",
    body: "মায়ের হাতের রান্নার স্বাদ ভোলা যায় না। আজও মনে পড়ে—সকালে উঠেই রান্নাঘরে ঢুকে দেখতাম, মা মাছ ভাজছেন। তেলে ফুটফুট শব্দ। ঘরে ভরের গন্ধ।\n\nবাবা বলতেন—তোর মায়ের হাত স্বর্গীয়। আমরা হেসে উড়িয়ে দিতাম। কিন্তু আসলেই। মায়ের হাত দিয়ে যা বানানো হতো, আর কোথাও পাইনি।\n\nদূরে থাকি এখন। মাসে একবার বাড়ি যাই। মা আবার রান্না করেন। আবার সেই স্বাদ। আবার বাড়ি।",
    summary: "মায়ের রান্নার স্মৃতি।",
    tags: ["দীর্ঘ", "প্রেম"],
    categorySlug: "swami-strir",
    language: "bn",
    lengthType: "long",
    status: "published",
    popularityScore: 60,
    createdAt: new Date("2025-06-10"),
    updatedAt: new Date("2025-06-10"),
    publishedAt: new Date("2025-06-10"),
  },
];

export interface Category {
  slug: string;
  label: string;
  count: number;
}

export const CATEGORIES: Category[] = [
  { slug: "uncategorized", label: "Uncategorized", count: 18 },
  { slug: "ojachar", label: "অজাচার বাংলা চটি গল্প", count: 3339 },
  { slug: "kajer-masi", label: "কাজের মাসি চোদার গল্প", count: 75 },
  { slug: "kajer-meye", label: "কাজের মেয়ে চোদার গল্প", count: 261 },
  { slug: "kumari-meye", label: "কুমারী মেয়ে চোদার গল্প", count: 660 },
  { slug: "grihobodhur", label: "গৃহবধূর চোদন কাহিনী", count: 2017 },
  { slug: "gay-sex", label: "গে সেক্স চটি", count: 68 },
  { slug: "group-sex", label: "গ্রুপ সেক্সের বাংলা চটি গল্প", count: 630 },
  { slug: "porokia", label: "পরকিয়া বাংলা চটি গল্প", count: 1272 },
  { slug: "poripokkho", label: "পরিপক্ক চোদাচুদির গল্প", count: 433 },
  { slug: "protibeshi", label: "প্রতিবেশি চোদার চটি গল্প", count: 298 },
  { slug: "femdom", label: "ফেমডম বাংলা চটি গল্প", count: 84 },
  { slug: "bandhobi", label: "বান্ধবী চোদার বাংলা চটি গল্প", count: 448 },
  { slug: "somokami", label: "সমকামী বাংলা চটি গল্প", count: 63 },
  { slug: "sera", label: "সেরা বাংলা চটি", count: 1635 },
  { slug: "students", label: "স্টুডেন্টস বাংলা চটি গল্প", count: 306 },
  { slug: "swami-strir", label: "স্বামী স্ত্রীর বাংলা চটি গল্প", count: 198 },
  { slug: "hijra-shemale", label: "হিজরা শীমেল বাংলা চটি গল্প", count: 14 },
];

export const BANGLA_MONTHS: Record<number, string> = {
  1: "জানুয়ারী",
  2: "ফেব্রুয়ারী",
  3: "মার্চ",
  4: "এপ্রিল",
  5: "মে",
  6: "জুন",
  7: "জুলাই",
  8: "আগস্ট",
  9: "সেপ্টেম্বর",
  10: "অক্টোবর",
  11: "নভেম্বর",
  12: "ডিসেম্বর",
};

export interface ArchiveMonth {
  year: number;
  month: number;
  label: string;
  slug: string;
}

/** Returns archive months in reverse chronological order (newest first) */
export function getArchiveMonths(
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number
): ArchiveMonth[] {
  const out: ArchiveMonth[] = [];
  let y = fromYear,
    m = fromMonth;
  while (y > toYear || (y === toYear && m >= toMonth)) {
    out.push({
      year: y,
      month: m,
      label: `${BANGLA_MONTHS[m]} ${y}`,
      slug: `${y}-${String(m).padStart(2, "0")}`,
    });
    m--;
    if (m < 1) {
      m = 12;
      y--;
    }
  }
  return out;
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}
