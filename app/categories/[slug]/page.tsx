import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPageClient from "@/components/CategoryPageClient";
import { CATEGORIES } from "@/lib/stories";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category" };
  const title = `${category.label} | Bangla Choti — বাংলা চটি গল্প`;
  const description = `${category.label} — ${category.count} bangla choti golpo, choti kahini। Read bangla choti. bongochoti.com`;
  const url = `${siteUrl}/categories/${slug}/`;
  return {
    title,
    description: description.slice(0, 160),
    keywords: [category.label, "bangla choti", "bangla choti golpo", ...SEO_KEYWORDS],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: title }],
    },
    twitter: { card: "summary_large_image", title },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  return <CategoryPageClient slug={slug} label={category.label} />;
}
