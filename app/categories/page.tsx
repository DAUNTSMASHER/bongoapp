import Link from "next/link";
import { CATEGORIES } from "@/lib/stories";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Categories</h1>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/categories/${slug}`}
            className="flex min-h-[100px] items-center justify-center rounded-lg border border-white/10 bg-[#181818] text-center text-base font-semibold text-white transition-all hover:bg-[var(--primary)] hover:border-[var(--primary)] active:scale-[0.98]"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
