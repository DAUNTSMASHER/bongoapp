import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import { CATEGORIES, formatCount } from "@/lib/stories";

export default function CategoriesPage() {
  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/" label="হোম" />
      </div>
      <h1 className="font-bangla mb-6 text-2xl font-bold text-white md:text-3xl">
        ক্যাটাগরি
      </h1>
      <div className="space-y-1">
        {CATEGORIES.map(({ slug, label, count }) => (
          <Link
            key={slug}
            href={`/categories/${slug}`}
            className="font-bangla block rounded-lg border border-white/10 bg-[#181818] px-4 py-3 text-base font-medium text-white transition-all hover:bg-[var(--primary)] hover:border-[var(--primary)] active:scale-[0.99] md:px-5 md:py-4 md:text-lg"
          >
            {label} ({formatCount(count)})
          </Link>
        ))}
      </div>
    </ContentWrapper>
  );
}
