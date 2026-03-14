import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArchiveMonthClient from "@/components/ArchiveMonthClient";
import { BANGLA_MONTHS, getArchiveMonths } from "@/lib/stories";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

export function generateStaticParams() {
  const months = getArchiveMonths(2026, 3, 2024, 3);
  return months.map((m) => ({ slug: m.slug }));
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [yearStr, monthStr] = slug.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return { title: "Archive" };
  const label = `${BANGLA_MONTHS[month] || ""} ${year}`;
  const url = `${siteUrl}/archive/${slug}/`;
  const desc = `${label} — bangla choti golpo, choti kahini আর্কাইভ। Bangla choti stories from ${label}. bongochoti.com`;
  return {
    title: `${label} | Bangla Choti আর্কাইভ`,
    description: desc.slice(0, 160),
    keywords: SEO_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} | Bangla Choti Archive | bongochoti`,
      description: `Bangla choti golpo from ${label}. Browse bangla choti kahini by month.`,
      url,
      type: "website",
      images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: `${label} | bongochoti` }],
    },
    twitter: { card: "summary_large_image", title: `${label} | bongochoti` },
    robots: { index: true, follow: true },
  };
}

export default async function ArchiveMonthPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [yearStr, monthStr] = slug.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) notFound();

  const label = `${BANGLA_MONTHS[month] || ""} ${year}`;
  return <ArchiveMonthClient slug={slug} label={label} />;
}
