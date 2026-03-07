"use client";

import Link from "next/link";

export const ITEMS_PER_PAGE_DEFAULT = 16;
export const ITEMS_PER_PAGE = ITEMS_PER_PAGE_DEFAULT; // alias for LatestList

interface PaginationBarProps {
  total: number;
  currentPage: number;
  basePath: string;
  itemsPerPage: number;
  searchParams?: Record<string, string>;
}

export default function PaginationBar({
  total,
  currentPage,
  basePath,
  itemsPerPage = ITEMS_PER_PAGE_DEFAULT,
  searchParams = {},
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) params.delete("page");
    else params.set("page", String(page));
    const q = params.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          ← আগের
        </Link>
      )}
      <span className="font-bangla px-3 py-2 text-sm text-white/70">
        পৃষ্ঠা {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          পরের →
        </Link>
      )}
    </nav>
  );
}
