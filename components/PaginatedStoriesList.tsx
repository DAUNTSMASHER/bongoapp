"use client";

import { useSearchParams } from "next/navigation";
import StoryCard from "./StoryCard";
import AdSlot from "./AdSlot";
import PaginationBar, { ITEMS_PER_PAGE } from "./PaginationBar";
import type { Story } from "@/types/story";

interface PaginatedStoriesListProps {
  stories: Story[];
  basePath: string;
  emptyMessage?: string;
}

export default function PaginatedStoriesList({
  stories,
  basePath,
  emptyMessage = "No stories yet.",
}: PaginatedStoriesListProps) {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = stories.slice(start, start + ITEMS_PER_PAGE);

  if (stories.length === 0) {
    return <p className="font-bangla text-white/70">{emptyMessage}</p>;
  }

  const pageParams: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    if (k !== "page") pageParams[k] = v;
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginated.map((story, i) => (
          <div key={story.id} className="contents">
            {(i === 1 || (i > 1 && (i - 1) % 5 === 0)) && (
              <div className="col-span-full my-4">
                <AdSlot placement="in-feed" />
              </div>
            )}
            <div>
              <StoryCard story={story} index={start + i} variant="list" />
            </div>
          </div>
        ))}
      </div>
      <PaginationBar
        total={stories.length}
        currentPage={page}
        basePath={basePath}
        searchParams={pageParams}
      />
    </>
  );
}
