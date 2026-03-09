import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPageClient from "@/components/CategoryPageClient";
import { CATEGORIES } from "@/lib/stories";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category" };
  const title = `${category.label}`;
  const description = `${category.label} — ${category.count} বাংলা চটি গল্প। Browse and read.`;
  const url = `${siteUrl}/categories/${slug}/`;
  return {
    title,
    description,
    keywords: [category.label, "bangla choti", "বাংলা চটি"],
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
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
