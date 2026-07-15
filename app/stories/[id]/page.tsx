import type { Metadata } from "next";
import StoryPageClient from "@/components/StoryPageClient";
import { getPublishedStoryById } from "@/lib/storyData";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";
import { cleanDescription } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

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
    if (!story) {
      const fallbackTitle = `Bangla Choti Story ${id} | bongochoti`;
      return {
        title: fallbackTitle,
        description: "Read this exclusive bangla choti golpo on bongochoti.com — the best platform for bengali stories.",
        openGraph: {
          title: fallbackTitle,
          url: `${siteUrl}/stories/${id}/`,
          images: [`${siteUrl}/logo.png`],
        }
      };
    }

    const rawTitle = story.seoTitle || story.headline || story.title;
    const title = rawTitle.includes("bangla choti") || rawTitle.includes("চটি") || rawTitle.includes("sex")
      ? `${rawTitle} | bongochoti`
      : `${rawTitle} | Bangla Choti & Sex Story`;
    const rawDesc = story.seoDescription || story.summary || (typeof story.body === "string" ? story.body : "");
    const description = cleanDescription(stripHtml(rawDesc), 160) || `পড়ুন নতুন বাংলা চটি গল্প: ${rawTitle}। ১৮+ কাহিনী ও সেক্স স্টোরি অনলাইনে একদম ফ্রি।`;

    const storyKw = story.hashtags?.map((h) => h.replace(/^#/, "")) || story.tags || [];
    const allKeywords = [...new Set([...storyKw, ...SEO_KEYWORDS])];

    const storyUrl = `${siteUrl}/stories/${id}/`;
    const coverUrl = story.coverImageUrl
      ? story.coverImageUrl.startsWith("http")
        ? story.coverImageUrl
        : `${siteUrl}${story.coverImageUrl.startsWith("/") ? "" : "/"}${story.coverImageUrl}`
      : `${siteUrl}/logo.png`;

    return {
      title,
      description,
      keywords: allKeywords,
      alternates: { canonical: storyUrl },
      openGraph: {
        title,
        description: description.slice(0, 160),
        url: storyUrl,
        type: "article",
        publishedTime: story.publishedAt instanceof Date ? story.publishedAt.toISOString() : undefined,
        modifiedTime: story.updatedAt instanceof Date ? story.updatedAt.toISOString() : undefined,
        images: [
          {
            url: coverUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: description.slice(0, 160),
        images: [coverUrl],
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
  const headline = story.seoTitle || story.headline || story.title;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: (story.seoDescription || story.summary || story.body?.slice(0, 200)) ?? "",
    url: `${siteUrl}/stories/${id}/`,
    datePublished: story.publishedAt instanceof Date ? story.publishedAt.toISOString() : undefined,
    dateModified: story.updatedAt instanceof Date ? story.updatedAt.toISOString() : undefined,
    author: { "@type": "Organization", name: "bongochoti", url: siteUrl },
    publisher: { "@type": "Organization", name: "bongochoti", logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` } },
    image: imageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/stories/${id}/` },
    inLanguage: "bn",
    keywords: SEO_KEYWORDS.join(", "),
    articleSection: story.categorySlug ? `Bangla Choti — ${story.categorySlug}` : "Bangla Choti",
    wordCount: story.body?.split(/\s+/).filter(Boolean).length,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "হোম", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "সব গল্প", item: `${siteUrl}/stories/` },
      { "@type": "ListItem", position: 3, name: headline, item: `${siteUrl}/stories/${id}/` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <StoryPageClient id={id} />
    </>
  );
}
