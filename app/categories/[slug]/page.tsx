import { notFound } from "next/navigation";
import StoryCard from "@/components/StoryCard";
import AdSlot from "@/components/AdSlot";
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
    (s) => s.tags.includes(slug) || s.lengthType === slug
  );

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-white">
        {category.label}
      </h1>
      <div className="space-y-4">
        {stories.length === 0 ? (
          <p className="text-white/70">No stories yet.</p>
        ) : (
          stories.map((story, i) => (
            <div key={story.id}>
              {(i === 1 || (i > 1 && (i - 1) % 5 === 0)) && (
                <div className="mb-4">
                  <AdSlot placement="in-feed" />
                </div>
              )}
              <StoryCard story={story} index={i} variant="list" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
