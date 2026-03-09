import type { Metadata } from "next";
import StoryPageClient from "@/components/StoryPageClient";
import { getPublishedStoryById } from "@/lib/storyData";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    let story: Awaited<ReturnType<typeof getPublishedStoryById>> = null;
    try {
      story = await getPublishedStoryById(id);
    } catch {
      // Server Firestore may fail; client will fetch
    }
    if (!story) return { title: "Story" };

  const title = story.seoTitle || story.headline || story.title;
  const description = story.seoDescription || story.summary || story.body?.slice(0, 155) + "…";

  return {
    title,
    description: description.slice(0, 160),
    keywords: story.hashtags?.map((h) => h.replace(/^#/, "")).join(", ") || story.tags?.join(", "),
    alternates: {
      canonical: `${siteUrl}/stories/${id}/`,
    },
    openGraph: {
      title,
      description: description.slice(0, 155),
      url: `${siteUrl}/stories/${id}/`,
      type: "article",
      publishedTime: story.publishedAt instanceof Date ? story.publishedAt.toISOString() : undefined,
      modifiedTime: story.updatedAt instanceof Date ? story.updatedAt.toISOString() : undefined,
      images: story.coverImageUrl
        ? [{ url: story.coverImageUrl.startsWith("http") ? story.coverImageUrl : `${siteUrl}${story.coverImageUrl.startsWith("/") ? "" : "/"}${story.coverImageUrl}`, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 155),
    },
    robots: { index: true, follow: true },
  };
  } catch {
    return { title: "Story" };
  }
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let story: Awaited<ReturnType<typeof getPublishedStoryById>> = null;
  try {
    story = await getPublishedStoryById(id);
  } catch {
    // Server Firestore may fail. Client will fetch and show story or 404.
  }

  if (!story) {
    return <StoryPageClient id={id} />;
  }

  const imageUrl = story.coverImageUrl?.startsWith("http")
    ? story.coverImageUrl
    : story.coverImageUrl
      ? `${siteUrl}${story.coverImageUrl.startsWith("/") ? "" : "/"}${story.coverImageUrl}`
      : undefined;
  const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: story.seoTitle || story.headline || story.title,
        description: (story.seoDescription || story.summary || story.body?.slice(0, 200)) ?? "",
        url: `${siteUrl}/stories/${id}/`,
        datePublished: story.publishedAt instanceof Date ? story.publishedAt.toISOString() : undefined,
        dateModified: story.updatedAt instanceof Date ? story.updatedAt.toISOString() : undefined,
        author: { "@type": "Organization", name: "bongochoti", url: siteUrl },
        publisher: { "@type": "Organization", name: "bongochoti", logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` } },
        image: imageUrl,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/stories/${id}/` },
        inLanguage: "bn",
      };

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <StoryPageClient id={id} />
    </>
  );
}
