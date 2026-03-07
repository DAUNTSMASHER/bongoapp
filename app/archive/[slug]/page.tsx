import { notFound } from "next/navigation";
import ArchiveMonthClient from "@/components/ArchiveMonthClient";
import { BANGLA_MONTHS, getArchiveMonths } from "@/lib/stories";

export function generateStaticParams() {
  const months = getArchiveMonths(2026, 3, 2024, 3);
  return months.map((m) => ({ slug: m.slug }));
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
