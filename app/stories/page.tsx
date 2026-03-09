import type { Metadata } from "next";
import AllStoriesPageClient from "@/components/AllStoriesPageClient";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export const metadata: Metadata = {
  title: "সব গল্প — বাংলা চটি | All Stories | bongochoti.online",
  description:
    "পড়ুন সব বাংলা চটি গল্প। প্রকাশিত সব গল্প এক জায়গায় — ক্যাটাগরি নির্বিশেষে। Read all bangla choti stories.",
  keywords: ["সব গল্প", "bangla choti", "বাংলা চটি", "all stories", "choti golpo"],
  alternates: { canonical: `${siteUrl}/stories/` },
  openGraph: {
    title: "সব গল্প — বাংলা চটি | All Stories",
    description: "পড়ুন সব বাংলা চটি গল্প। ক্যাটাগরি নির্বিশেষে।",
    url: `${siteUrl}/stories/`,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "সব গল্প — বাংলা চটি" },
  robots: { index: true, follow: true },
};

export default function AllStoriesPage() {
  return <AllStoriesPageClient />;
}
