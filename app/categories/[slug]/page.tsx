import { notFound } from "next/navigation";
import CategoryPageClient from "@/components/CategoryPageClient";
import { CATEGORIES } from "@/lib/stories";

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

  return <CategoryPageClient slug={slug} label={category.label} />;
}
