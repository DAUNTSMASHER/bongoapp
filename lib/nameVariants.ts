/**
 * Name variant mappings for creating story variants when duplicate detected.
 * Each name maps to alternative names - we pick one to replace, producing a unique variant.
 * Expanded from common Bangla choti patterns (X বলল, Xএর, আমার নাম X, X আন্টি, etc.)
 */
export const NAME_VARIANTS: Record<string, string[]> = {
  // Female – high frequency in stories
  অনিতা: ["অপরাজিতা", "নিপা", "পূজা", "ঋদ্ধি"],
  আনিতা: ["আনিকা", "অনামিকা", "অঞ্জু"],
  সীমা: ["সীমান্ত", "সুপ্রিয়া", "সোনালি", "সায়নী"],
  সীমান্ত: ["সুমন", "সাগর", "বিপ্লব", "সৌরভ"],
  পূজা: ["পূজিতা", "পিংকি", "প্রিয়াঙ্কা", "পায়েল"],
  প্রিয়তা: ["প্রিয়া", "প্রিয়াঙ্কা", "প্রীতি", "প্রিয়ম"],
  প্রিয়া: ["প্রিয়াঙ্কা", "প্রীতি", "প্রিয়তা", "পায়েল"],
  দীপা: ["দীপিকা", "দিপান্বিতা", "দীপ্তি", "দিশা"],
  দীপিকা: ["দিপা", "দীপ্তি", "দিশা", "দেবযানী"],
  রিনা: ["রিনি", "রিমি", "রুনা", "রিয়া"],
  রিয়া: ["রিমি", "রুনা", "রিনা", "রেখা"],
  রিমি: ["রিমা", "রুনা", "রিয়া", "রিনা"],
  সুমি: ["সুমনা", "সোনালি", "সুপ্রিয়া", "সায়নী"],
  টিনা: ["তানিয়া", "তন্নী", "তিথি", "টুলু"],
  তানিয়া: ["টিনা", "তন্নী", "তিথি", "তৃষা"],
  তন্নী: ["তানিয়া", "টিনা", "প্রিয়াঙ্কা", "শ্রেয়া"],
  কুসুম: ["কুমকুম", "কমলিনী", "কেয়া", "কনক"],
  মাধবি: ["মাধুরী", "মালা", "মিমি", "মোনা"],
  নবনীতা: ["নয়নতারা", "নিমা", "নিশি", "নাজনীন"],
  নিশি: ["নিশাত", "নিশা", "নিমা", "নীলু"],
  নিমা: ["নিশি", "নয়না", "নাজনীন", "নাফিস"],
  রুমেলা: ["রুনা", "রিমা", "রিয়া", "রেখা"],
  সুদেষ্ণা: ["সুপ্রিয়া", "সোনালি", "সায়নী", "সুমনা"],
  রত্না: ["রেখা", "রিমি", "রুপা", "রিনা"],
  রেখা: ["রিমি", "রত্না", "রুপা", "রিয়া"],
  শিলা: ["শিল্পী", "শ্রেয়া", "শেফালি", "শান্তি"],
  মালা: ["মালিনী", "মিমি", "মোনিকা", "মাধুরী"],
  সোনিয়া: ["সোনালি", "সুনিদা", "সাবিনা", "সায়নী"],
  সোনালি: ["সোনিয়া", "সুপ্রিয়া", "সায়নী", "সুমনা"],
  সাবিনা: ["সাবা", "সাবনাম", "সায়নী", "সুমি"],
  জয়া: ["জয়ন্তী", "জিনাত", "জাহানারা", "জিনিয়া"],
  লতা: ["লতিকা", "লাবণ্য", "লিলি", "লাবণী"],
  ইলা: ["ইলু", "ইলিন", "ইশা", "ইন্দু"],
  নাজমা: ["নাজনীন", "নাজিমা", "নাজু", "নাসিমা"],
  শাহিনা: ["শাহানা", "শারমিন", "শায়নাজ", "শিল্পী"],
  সিঁথি: ["সীমা", "সিমরান", "সিফাত", "সিনথিয়া"],
  কান্তা: ["কনক", "কামনা", "কেয়া", "কাবেরী"],
  অঞ্জলি: ["অনন্যা", "অনামিকা", "অপর্ণা", "অঞ্জু"],
  কবিতা: ["কোমল", "কনক", "কেয়া", "কাবেরী"],
  নীতা: ["নীলা", "নিশাত", "নাজনীন", "নাফিস"],
  নবনী: ["নাভি", "নাজ", "নাফিস", "নিশি"],

  // Male – high frequency
  রাহুল: ["রাকিব", "রিফাত", "রজত", "রায়ান"],
  রাজ: ["রাজু", "রাজিব", "রজত", "রিফাত"],
  রাজু: ["রাজিব", "রাজ", "রাকিব", "রিফাত"],
  রাজিব: ["রাজু", "রাজ", "রাকিব", "রন্টি"],
  রাকিব: ["রাজু", "রাহুল", "রিফাত", "রাজিব"],
  রামেশ: ["রহিম", "রামু", "রাহাত", "রজত"],
  রামু: ["রামেশ", "রহিম", "রাকিব", "রিফাত"],
  করিম: ["কবির", "কামাল", "কাশেম", "কাওসার"],
  কবির: ["করিম", "কামাল", "কাশেম", "কবীর"],
  কবীর: ["করিম", "কবির", "কামাল", "কাশেম"],
  সঞ্জয়: ["সাজিদ", "সোহেল", "সমীর", "সুমন"],
  সাজিদ: ["সোহেল", "সঞ্জয়", "সাব্বির", "সুমিত"],
  সুমন: ["সুমিত", "সুহেল", "সাব্বির", "সাগর"],
  সাগর: ["সুমন", "সৌরভ", "সাব্বির", "সোহেল"],
  বশির: ["বশিরুদ্দিন", "বদরুল", "বকুল", "বিকাশ"],
  রতন: ["রিফাত", "রাকিব", "রাজিব", "রন্টি"],
  বিশু: ["বিশাল", "বিকাশ", "বিপুল", "বাপ্পি"],
  কামদেব: ["কবির", "কামাল", "কাশেম", "করিম"],
  রাজেশ: ["রাজু", "রাজিব", "রাজ", "রাকিব"],

  // Kinship / role terms (often part of name context)
  মামনি: ["মিমি", "মোনিকা", "মালা", "মাধুরী"],
  পিসি: ["খালা", "মামী", "কাকিমা", "ফুফু"],
  বৌদি: ["বউদি", "ভাবি", "ভাবি"],
  দিদি: ["আপু", "দাদি", "দি"],
  শশুর: ["শ্বশুর", "বাবা", "বাবু"],
  শাশুড়ি: ["শ্বাশুড়ি", "মা", "আম্মু"],
};

/** Context word swaps – add textual variety when creating variants (doesn't affect storyId) */
const CONTEXT_VARIANTS: [string, string[]][] = [
  ["শহর", ["নগর", "মহানগর"]],
  ["নগর", ["শহর", "মহানগর"]],
  ["গ্রাম", ["পল্লী", "গ্রাম্য"]],
  ["পল্লী", ["গ্রাম", "গ্রাম্য"]],
  ["বাসা", ["ঘর", "বাড়ি"]],
  ["ঘর", ["বাসা", "বাড়ি"]],
  ["বিছানা", ["শয্যা", "বেড"]],
  ["শয্যা", ["বিছানা", "বেড"]],
  ["সকাল", ["ভোর", "প্রভাত"]],
  ["রাতে", ["রাতের বেলায়", "রাত"]],
];

/** Suffix/variant for title – used when no name replacements happen (fallback) */
const TITLE_SUFFIXES = [
  " — নতুন পর্ব",
  " — পূর্ণ গল্প",
  " — স্পেশাল সংস্করণ",
  " পার্ট ২",
  " পর্ব ১",
  " (ভাইরাল)",
  " — রিভিজিটেড",
  " — এক্সক্লুসিভ",
];

/**
 * Apply context word swaps for extra textual variety.
 * Safe: these words are not character names, so storyId stays same when used alongside name changes.
 */
function applyContextVariants(text: string, maxSwaps = 3): string {
  let out = text;
  let swaps = 0;
  for (const [from, alts] of CONTEXT_VARIANTS) {
    if (swaps >= maxSwaps) break;
    if (!out.includes(from)) continue;
    const chosen = alts[Math.floor(Math.random() * alts.length)];
    out = out.split(from).join(chosen);
    swaps++;
  }
  return out;
}

/**
 * Apply random name variants to body and title to create a unique story variant.
 * If no names match, applies title suffix + context swaps (may not change storyId – caller should retry or skip).
 * Uses simple split/join to avoid regex edge cases with Bangla.
 */
export function applyNameVariants(body: string, title: string): { body: string; title: string } {
  const names = Object.keys(NAME_VARIANTS);
  if (names.length === 0) return { body, title };

  let newBody = body;
  const replacements: { from: string; to: string }[] = [];

  // Replace all matching names (order by length desc to avoid partial overlap issues)
  const sortedNames = [...names].sort((a, b) => b.length - a.length);
  for (const name of sortedNames) {
    const alts = NAME_VARIANTS[name];
    if (!alts?.length) continue;
    if (!newBody.includes(name)) continue;
    const chosen = alts[Math.floor(Math.random() * alts.length)];
    newBody = newBody.split(name).join(chosen);
    replacements.push({ from: name, to: chosen });
  }

  let newTitle = title;
  for (const { from, to } of replacements) {
    if (newTitle.includes(from)) {
      newTitle = newTitle.split(from).join(to);
    }
  }

  // Fallback: no name matched – use title suffix + context swaps (storyId may not change)
  if (replacements.length === 0) {
    const suffix = TITLE_SUFFIXES[Math.floor(Math.random() * TITLE_SUFFIXES.length)];
    newTitle = (newTitle.replace(/ — .+$| পার্ট \d+$| পর্ব \d+$/g, "").trim() + suffix).trim();
    newBody = applyContextVariants(body, 2);
  } else {
    // Extra variety when we have name replacements
    newBody = applyContextVariants(newBody, 2);
  }

  return { body: newBody, title: newTitle };
}
