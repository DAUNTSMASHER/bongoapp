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
      <div className="space-y-12">
        {/* Topic Cluster: Relationship Psychology */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white md:text-2xl">Psychology & Attraction</h2>
            <span className="rounded-full bg-[var(--primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--primary)]">Topic Cluster</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {BLOG_POSTS.filter(p => p.slug.includes("psychology") || p.slug.includes("attraction")).map((post) => (
              <article
                key={post.slug}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#181818] transition-all hover:border-[var(--primary)]/50 hover:bg-[#202020]"
              >
                <Link href={`/blog/${post.slug}/`} className="block aspect-video w-full overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <Link href={`/blog/${post.slug}/`} className="block">
                    <h3 className="font-bangla text-lg font-semibold text-white group-hover:text-[var(--primary)] md:text-xl">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="font-bangla mt-2 text-sm text-white/70 line-clamp-2">{post.description}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                     <span className="text-xs text-white/40">{post.publishedAt}</span>
                     <Link href={`/blog/${post.slug}/`} className="text-sm font-bold text-[var(--primary)]">Read More</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Viral / Story Content */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white md:text-2xl">Viral Stories & Confessions</h2>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">Emotional</span>
          </div>
          <div className="space-y-4">
            {BLOG_POSTS.filter(p => p.slug.includes("confessions") || p.slug.includes("story")).map((post) => (
              <article
                key={post.slug}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#181818] p-4 transition-colors hover:bg-[#202020]"
              >
                <div className="hidden size-16 shrink-0 items-center justify-center rounded-lg bg-white/5 md:flex">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="flex-1">
                  <Link href={`/blog/${post.slug}/`}>
                    <h3 className="font-bangla text-lg font-medium text-white hover:text-[var(--primary)]">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="font-bangla text-xs text-white/60 line-clamp-1">{post.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Other Guides */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">Bangla Choti Guides</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.filter(p => !p.slug.includes("psychology") && !p.slug.includes("attraction") && !p.slug.includes("confessions")).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}/`} className="group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-[#121212] transition-all hover:bg-white/5">
                <div className="aspect-[21/9] w-full overflow-hidden">
                  <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[var(--primary)]">{post.title}</h3>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">{post.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
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
