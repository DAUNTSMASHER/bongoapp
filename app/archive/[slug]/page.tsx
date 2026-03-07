import { Suspense } from "react";
import { notFound } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import PaginatedStoriesList from "@/components/PaginatedStoriesList";
import { MOCK_STORIES, BANGLA_MONTHS, getArchiveMonths } from "@/lib/stories";

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
  const stories = MOCK_STORIES.filter((s) => {
    const d = s.publishedAt || s.createdAt;
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/archive/" label="আর্কাইভ" />
      </div>
      <h1 className="font-bangla mb-6 text-2xl font-bold text-white md:text-3xl">
        আর্কাইভ — {label}
      </h1>
      <Suspense fallback={<p className="font-bangla text-white/60">Loading...</p>}>
        <PaginatedStoriesList
          stories={stories}
          basePath={`/archive/${slug}/`}
          emptyMessage="এই মাসে কোনো গল্প নেই।"
        />
      </Suspense>
    </ContentWrapper>
  );
}
