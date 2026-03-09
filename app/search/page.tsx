import type { Metadata } from "next";
import SearchPageClient from "@/components/SearchPageClient";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export const metadata: Metadata = {
  title: "সার্চ — বাংলা চটি গল্প ও ভিডিও",
  description: "বাংলা চটি গল্প ও ভিডিও সার্চ করুন। Search Bangla choti stories and videos.",
  alternates: { canonical: `${siteUrl}/search/` },
  openGraph: { title: "Search | bongochoti", url: `${siteUrl}/search/` },
  robots: { index: true, follow: true },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <SearchPageClient />
    </div>
  );
}
