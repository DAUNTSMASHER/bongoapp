import type { Metadata } from "next";
import { Suspense } from "react";
import VideosPageClient from "@/components/VideosPageClient";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export const metadata: Metadata = {
  title: "Sex Video | Bangla Sex Video | বাংলা পর্ন ভিডিও | ১০০০+ ভিডিও",
  description:
    "Bangla sex video ও porn video দেখুন। ১০০০+ বাংলা পর্ন ভিডিও, choti video। Watch bangla porn video, sex video online.",
  keywords: [
    "sex video",
    "bangla sex video",
    "bangla porn video",
    "বাংলা পর্ন ভিডিও",
    "বাংলা সেক্স ভিডিও",
    "choti video",
    "bangla choti video",
    "porn video",
  ],
  alternates: { canonical: `${siteUrl}/videos/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sex Video | Bangla Porn Video | বাংলা সেক্স ভিডিও | bongochoti",
    description: "১০০০+ bangla sex video, porn video। Watch bangla porn video online.",
    url: `${siteUrl}/videos/`,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Sex Video | Bangla Porn | bongochoti" },
};

export default function VideosPage() {
  return (
    <Suspense fallback={<p className="font-bangla text-white/60 p-6">লোড হচ্ছে...</p>}>
      <VideosPageClient />
    </Suspense>
  );
}
