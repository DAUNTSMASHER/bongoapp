import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import { getBlogPost, getAllBlogSlugs } from "@/lib/blogPosts";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";
import BannerAd from "@/components/BannerAd";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog" };
  const desc = post.description.slice(0, 160);
  return {
    title: post.title,
    description: desc,
    keywords: [...SEO_KEYWORDS, "bangla choti", "choti golpo"],
    alternates: { canonical: `${siteUrl}/blog/${slug}/` },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: desc,
      url: `${siteUrl}/blog/${slug}/`,
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: post.coverImage || `${siteUrl}/logo.png`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: desc, images: [post.coverImage || `${siteUrl}/logo.png`] },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const blogUrl = `${siteUrl}/blog/${slug}/`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description.slice(0, 160),
    url: blogUrl,
    datePublished: post.publishedAt,
    publisher: { "@type": "Organization", name: "bongochoti", logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": blogUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/blog/" label="ব্লগ" />
      </div>
      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          {post.coverImage && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img src={post.coverImage} alt={post.title} className="aspect-video w-full object-cover" />
            </div>
          )}
          <h1 className="font-bangla text-2xl font-bold text-white md:text-3xl">{post.title}</h1>
          <p className="mt-2 text-sm text-white/60">{post.publishedAt}</p>
        </header>
        <div className="mb-8 flex justify-center">
          <BannerAd placement="blog-post-top" variant="leaderboard" />
        </div>
        <div className="prose prose-invert max-w-none font-bangla text-white/90 [&_a]:text-[var(--primary)] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-90 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_li]:mt-1 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
          {post.body}
        </div>
        <div className="mt-10 flex justify-center">
          <BannerAd placement="blog-post-bottom" variant="large" />
        </div>
        <footer className="mt-12 flex flex-wrap gap-4 border-t border-white/10 pt-8">
          <Link href="/blog/" className="text-sm text-[var(--primary)] hover:underline">
            ← সব ব্লগ পোস্ট
          </Link>
          <Link href="/" className="text-sm text-[var(--primary)] hover:underline">
            হোম
          </Link>
          <Link href="/stories/" className="text-sm text-[var(--primary)] hover:underline">
            সব গল্প
          </Link>
          <Link href="/categories/" className="text-sm text-[var(--primary)] hover:underline">
            বিভাগ
          </Link>
        </footer>
      </article>
    </ContentWrapper>
    </>
  );
}
