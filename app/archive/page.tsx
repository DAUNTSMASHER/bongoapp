import type { Metadata } from "next";
import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import { getArchiveMonths } from "@/lib/stories";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export const metadata: Metadata = {
  title: "আর্কাইভ — বাংলা চটি গল্প",
  description: "বাংলা চটি গল্প আর্কাইভ। মাস ও বছর অনুযায়ী গল্প দেখুন।",
  alternates: { canonical: `${siteUrl}/archive/` },
  openGraph: { title: "Archive | bongochoti", url: `${siteUrl}/archive/` },
  robots: { index: true, follow: true },
};

export default function ArchivePage() {
  const archiveMonths = getArchiveMonths(2026, 3, 2024, 3);

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/" label="হোম" />
      </div>
      <h1 className="font-bangla mb-6 text-2xl font-bold text-white md:text-3xl">
        আর্কাইভ
      </h1>
      <div className="space-y-1">
        {archiveMonths.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/archive/${slug}`}
            className="font-bangla block rounded-lg border border-white/10 bg-[#181818] px-4 py-2.5 text-base text-white transition-all hover:bg-white/10 md:px-5 md:py-3"
          >
            {label}
          </Link>
        ))}
      </div>
    </ContentWrapper>
  );
}
