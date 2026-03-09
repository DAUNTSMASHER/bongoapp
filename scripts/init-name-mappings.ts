/**
 * Initializes Firestore config/nameMappings with default name replacements.
 * Run: npx tsx scripts/init-name-mappings.ts
 *
 * Add or edit mappings in Firebase Console → Firestore → config/nameMappings
 * Format: { mappings: { "originalName": "replacementName", ... } }
 */

import { initFirestore } from "./crawler/saveToFirestore";

const DEFAULT_MAPPINGS: Record<string, string> = {
  রাহুল: "রাকিব",
  রাজ: "রাজিব",
  সুনিল: "সাজিদ",
  অরুণ: "অর্ণব",
  মোহন: "মাহমুদ",
  রমেশ: "রহিম",
  অঞ্জলি: "অনন্যা",
  দীপিকা: "দিপা",
  আনিতা: "আনিকা",
  কবীর: "করিম",
  বলরাম: "বদরুল",
  গোপাল: "গোলাম",
  রাজেশ: "রাজু",
  মনোজ: "মনির",
  সুরেশ: "সোহেল",
  আদিত্য: "আদনান",
  অনিল: "আনিস",
};

async function main() {
  const firestore = initFirestore();
  const ref = firestore.collection("config").doc("nameMappings");

  const existing = await ref.get();
  if (existing.exists) {
    const data = existing.data();
    const current = (data?.mappings || {}) as Record<string, string>;
    const merged = { ...DEFAULT_MAPPINGS, ...current };
    await ref.set({ mappings: merged });
    console.log(`Updated nameMappings: ${Object.keys(merged).length} entries`);
  } else {
    await ref.set({ mappings: DEFAULT_MAPPINGS });
    console.log(`Created nameMappings: ${Object.keys(DEFAULT_MAPPINGS).length} entries`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
