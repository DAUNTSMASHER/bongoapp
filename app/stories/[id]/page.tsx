import type { Metadata } from "next";
import StoryPageClient from "@/components/StoryPageClient";
import { getPublishedStoryById } from "@/lib/storyData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const story = await getPublishedStoryById(id);
  if (!story) return { title: "Story | bongochoti" };

  const title = story.seoTitle || story.headline || story.title;
  const description = story.seoDescription || story.summary || story.body?.slice(0, 155) + "…";

  return {
    title: `${title} | bongochoti`,
    description: description.slice(0, 160),
    keywords: story.hashtags?.map((h) => h.replace(/^#/, "")).join(", ") || story.tags?.join(", "),
    openGraph: {
      title,
      description: description.slice(0, 155),
    },
    twitter: {
      card: "summary",
      title,
      description: description.slice(0, 155),
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StoryPageClient id={id} />;
}
