import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArchiveMonthClient from "@/components/ArchiveMonthClient";
import { BANGLA_MONTHS, getArchiveMonths } from "@/lib/stories";

export function generateStaticParams() {
  const months = getArchiveMonths(2026, 3, 2024, 3);
  return months.map((m) => ({ slug: m.slug }));
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

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
  return {
    title: `আর্কাইভ: ${label}`,
    description: `${label} — বাংলা চটি গল্প আর্কাইভ। Stories from ${label}.`,
    alternates: { canonical: url },
    openGraph: { title: `Archive: ${label}`, description: `Stories from ${label}.`, url },
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
