import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-bangla text-2xl font-bold text-white md:text-3xl">
        পেজটি পাওয়া যায়নি
      </h1>
      <p className="font-bangla text-center text-white/70">
        আপনি যে লিংকে ক্লিক করেছেন তা আর উপলব্ধ নেই অথবা ঠিকানাটি ভুল।
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          হোমে ফিরে যান
        </Link>
        <Link
          href="/videos"
          className="rounded-lg border border-white/20 px-6 py-3 font-medium text-white/80 hover:bg-white/10 hover:text-white"
        >
          ভিডিও
        </Link>
        <Link
          href="/categories"
          className="rounded-lg border border-white/20 px-6 py-3 font-medium text-white/80 hover:bg-white/10 hover:text-white"
        >
          ক্যাটাগরি
        </Link>
      </div>
    </div>
  );
}
