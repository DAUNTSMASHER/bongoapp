"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback } from "react";
import StoryCard from "@/components/StoryCard";
import { MOCK_STORIES } from "@/lib/stories";

function SearchForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const q = (form.elements.namedItem("q") as HTMLInputElement)?.value;
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    },
    [router]
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        name="q"
        placeholder="Search stories..."
        defaultValue={defaultValue}
        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/50 transition-colors focus:border-[var(--primary)] focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-[var(--primary-hover)] active:scale-95"
      >
        Search
      </button>
    </form>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  const results = q
    ? MOCK_STORIES.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      )
    : [];

  return (
    <div className="space-y-4 px-4 py-6">
      {!q ? (
        <p className="text-white/70">
          Type to search stories by title or tag.
        </p>
      ) : results.length === 0 ? (
        <p className="text-white/70">No results for &quot;{q}&quot;</p>
      ) : (
        results.map((story, i) => <StoryCard key={story.id} story={story} index={i} variant="list" />)
      )}
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur-sm">
        <SearchForm defaultValue={q} />
      </div>
      <SearchResults />
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
