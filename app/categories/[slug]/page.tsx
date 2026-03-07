import { Suspense } from "react";
import { notFound } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import PaginatedStoriesList from "@/components/PaginatedStoriesList";
import { MOCK_STORIES, CATEGORIES } from "@/lib/stories";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const stories = MOCK_STORIES.filter(
    (s) => s.categorySlug === slug || s.tags.includes(slug) || s.lengthType === slug
  );

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/categories/" label="ক্যাটাগরি" />
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">
        {category.label}
      </h1>
      <Suspense fallback={<p className="text-white/60">Loading...</p>}>
        <PaginatedStoriesList
          stories={stories}
          basePath={`/categories/${slug}/`}
          emptyMessage="No stories yet."
        />
      </Suspense>
    </ContentWrapper>
  );
}
