import type { Metadata } from "next";
import CategoriesPageClient from "@/components/CategoriesPageClient";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export const metadata: Metadata = {
  title: "Bangla Choti বিভাগ | বাংলা চটি গল্প ক্যাটাগরি",
  description: "Bangla choti golpo এর সব বিভাগ — অজাচার, কাজের মেয়ে, গৃহবধূ, সেরা চটি। choti kahini by category.",
  keywords: ["bangla choti", "choti golpo", "বাংলা চটি বিভাগ", "choti kahini categories"],
  alternates: { canonical: `${siteUrl}/categories/` },
  openGraph: { title: "Bangla Choti Categories | বাংলা চটি বিভাগ | bongochoti", url: `${siteUrl}/categories/` },
  robots: { index: true, follow: true },
};

export default function CategoriesPage() {
  return <CategoriesPageClient />;
}
