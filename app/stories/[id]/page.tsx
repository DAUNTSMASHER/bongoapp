import { notFound } from "next/navigation";
import StoryReader from "@/components/StoryReader";
import { MOCK_STORIES } from "@/lib/stories";

export function generateStaticParams() {
  return MOCK_STORIES.map((s) => ({ id: s.id }));
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = MOCK_STORIES.find((s) => s.id === id);

  if (!story) notFound();

  return <StoryReader story={story} />;
}
