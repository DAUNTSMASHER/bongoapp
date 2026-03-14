import type { Metadata } from "next";
import { Suspense } from "react";
import VideosPageClient from "@/components/VideosPageClient";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  title: "Bangla Sex Video | বাংলা পর্ন ভিডিও — ১০০০+ ভিডিও | bongochoti",
  description:
    "Bangla sex video ও porn video দেখুন। ১০০০+ বাংলা পর্ন ভিডিও, choti video। Watch bangla porn video, sex video online. bongochoti.com",
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${siteUrl}/videos/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Bangla Sex Video | বাংলা পর্ন ভিডিও | ১০০০+ | bongochoti",
    description: "১০০০+ bangla sex video, porn video। Watch bangla porn video online. Free streaming.",
    url: `${siteUrl}/videos/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Bangla Sex Video | bongochoti" }],
  },
  twitter: { card: "summary_large_image", title: "Bangla Sex Video | bongochoti" },
};

export default function VideosPage() {
  return (
    <Suspense fallback={<p className="font-bangla text-white/60 p-6">লোড হচ্ছে...</p>}>
      <VideosPageClient />
    </Suspense>
  );
}
