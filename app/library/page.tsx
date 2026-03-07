"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import { ITEMS_PER_PAGE } from "@/components/PaginationBar";
import { useAuth } from "@/hooks/useAuth";
import { getWatchedVideos, type WatchedVideo } from "@/lib/library";

export default function LibraryPage() {
  const { user, isAnonymous, loading } = useAuth();
  const [watched, setWatched] = useState<WatchedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user?.uid || isAnonymous) {
      setLoadingVideos(false);
      return;
    }
    getWatchedVideos(user.uid)
      .then(setWatched)
      .catch(() => setWatched([]))
      .finally(() => setLoadingVideos(false));
  }, [user?.uid, isAnonymous]);

  if (loading) {
    return (
      <ContentWrapper className="flex min-h-screen items-center justify-center py-8">
        <p className="text-white/60">Loading...</p>
      </ContentWrapper>
    );
  }

  if (!user || isAnonymous) {
    return (
      <ContentWrapper className="min-h-screen py-6 md:py-8">
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
        </div>
        <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">My Library</h1>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
          <p className="font-bangla text-amber-200">
            আপনার দেখা ভিডিও সংরক্ষণ করতে সাইন ইন করুন।
          </p>
          <Link
            href="/profile/"
            className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover"
          >
            Sign in
          </Link>
        </div>
      </ContentWrapper>
    );
  }

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = watched.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(watched.length / ITEMS_PER_PAGE));

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton />
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">My Library</h1>

      <section>
        <h2 className="font-bangla mb-4 text-lg font-semibold text-white">
          সম্প্রতি দেখা
        </h2>
        {loadingVideos ? (
          <p className="text-white/60">Loading...</p>
        ) : watched.length === 0 ? (
          <p className="font-bangla text-white/60">
            আপনি এখনও কোনো ভিডিও দেখেননি। ভিডিও দেখুন এবং এখানে দেখা হবে।
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((w) => (
                <Link
                  key={w.videoId}
                  href={`/videos/?watch=${encodeURIComponent(w.videoId)}`}
                  className="group block overflow-hidden rounded-lg bg-[var(--card-bg)] transition-transform hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-b from-[var(--primary)]/40 to-[var(--card-bg)]">
                    <Image
                      src={w.thumbnailUrl}
                      alt={w.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bangla line-clamp-2 text-sm font-semibold text-white group-hover:text-primary">
                      {w.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/50">
                      {new Date(w.watchedAt).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    ← আগের
                  </button>
                )}
                <span className="font-bangla px-3 py-2 text-sm text-white/70">
                  পৃষ্ঠা {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    পরের →
                  </button>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </ContentWrapper>
  );
}
