import type { Metadata } from "next";
import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  title: "Blog | Bangla Choti Guide, Categories, Tips | bongochoti",
  description:
    "Read bangla choti guides: categories, how to read online free, bangla sex video tips. ১৮০০+ golpo, ১০০০+ video guides. bongochoti.com",
  keywords: [...SEO_KEYWORDS, "bangla choti blog", "choti guide"],
  alternates: { canonical: `${siteUrl}/blog/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Blog | Bangla Choti & Sex Video Guides | bongochoti",
    description: "Guides for bangla choti golpo, categories, how to read online. bongochoti blog.",
    url: `${siteUrl}/blog/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Bangla Choti Blog | bongochoti" }],
  },
  twitter: { card: "summary_large_image", title: "Blog | bongochoti" },
};

export default function BlogPage() {
  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/" label="হোম" />
      </div>
      <h1 className="font-bangla mb-2 text-2xl font-bold text-white md:text-3xl">
        Blog — Bangla Choti Guide
      </h1>
      <p className="font-bangla mb-8 text-white/70">
        Guides, tips, and articles about bangla choti golpo, choti kahini, and bangla sex video.
      </p>
      <div className="space-y-6">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-lg border border-white/10 bg-[#181818] p-5 transition-colors hover:border-white/20 md:p-6"
          >
            <Link href={`/blog/${post.slug}/`} className="block">
              <h2 className="font-bangla text-lg font-semibold text-white hover:text-[var(--primary)] md:text-xl">
                {post.title}
              </h2>
            </Link>
            <p className="font-bangla mt-2 text-sm text-white/75 line-clamp-2">{post.description}</p>
            <p className="mt-2 text-xs text-white/50">{post.publishedAt}</p>
            <Link
              href={`/blog/${post.slug}/`}
              className="font-bangla mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
            >
              পড়ুন →
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-10 rounded-lg border border-white/10 p-6">
        <h2 className="font-bangla text-lg font-bold text-white">দ্রুত লিংক</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/" className="text-sm text-[var(--primary)] hover:underline">
            হোম
          </Link>
          <Link href="/stories/" className="text-sm text-[var(--primary)] hover:underline">
            সব গল্প
          </Link>
          <Link href="/categories/" className="text-sm text-[var(--primary)] hover:underline">
            বিভাগ
          </Link>
          <Link href="/videos/" className="text-sm text-[var(--primary)] hover:underline">
            ভিডিও
          </Link>
          <Link href="/about/" className="text-sm text-[var(--primary)] hover:underline">
            সম্পর্কে
          </Link>
        </div>
      </div>
    </ContentWrapper>
  );
}
