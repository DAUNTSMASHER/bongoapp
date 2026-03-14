import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { formatBanglaCount } from "@/lib/banglaNumbers";
import { CATEGORIES } from "@/lib/stories";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  title: "About | Bangla Choti ও Sex Video প্ল্যাটফর্ম | bongochoti",
  description:
    "bongochoti — bangla choti golpo ও sex video প্ল্যাটফর্ম। ১৮০০+ বাংলা চটি গল্প, ১০০০+ bangla porn video। Free bangla choti kahini, categories, search. bongochoti.com",
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${siteUrl}/about/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "About bongochoti | Bangla Choti & Sex Video Platform",
    description: "১৮০০+ bangla choti golpo, ১০০০+ bangla sex video. Free, categories, search, archive.",
    url: `${siteUrl}/about/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "About bongochoti | Bangla Choti" }],
  },
  twitter: { card: "summary_large_image", title: "About bongochoti" },
};

const FEATURES = [
  {
    title: "বিনামূল্যে গল্প ও ভিডিও",
    desc: "সব bangla choti golpo এবং bangla sex video বিনামূল্যে পড়ুন ও দেখুন।",
  },
  {
    title: "বিভিন্ন বিভাগ",
    desc: "অজাচার, পরকিয়া, গৃহবধূ, সেরা চটি সহ ১৮+ ক্যাটাগরিতে গল্প খুঁজুন।",
  },
  {
    title: "সার্চ ও আর্কাইভ",
    desc: "গল্প খুঁজুন, তারিখ অনুযায়ী আর্কাইভ ব্রাউজ করুন।",
  },
  {
    title: "১৮+ কন্টেন্ট",
    desc: "প্রাপ্তবয়স্কদের জন্য বাংলা চটি গল্প ও sex video।",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* Hero with logo */}
      <header className="mb-12 text-center">
        <Link href="/" className="inline-block">
          <Logo size={80} showText />
        </Link>
        <p className="font-bangla mt-4 text-lg text-white/80 md:text-xl">
          Bangla choti golpo ও sex video — বাংলা চটির প্ল্যাটফর্ম
        </p>
      </header>

      {/* Intro */}
      <section className="netflix-section mb-8 rounded-lg border border-white/10 p-6 md:p-8">
        <h1 className="font-bangla text-xl font-bold text-white md:text-2xl">
          bongochoti কি?
        </h1>
        <p className="font-bangla mt-4 leading-relaxed text-white/85">
          <strong className="text-white">bongochoti</strong> হল বাংলা চটি গল্প (bangla choti golpo) ও
          sex video এর একটি অনলাইন প্ল্যাটফর্ম। এখানে আপনি হাজারো bangla choti kahini এবং bangla
          porn video পাবেন — বিনামূল্যে, যেকোনো ডিভাইস থেকে। আমাদের কন্টেন্ট বিভিন্ন বিভাগে সাজানো,
          সার্চ এবং আর্কাইভ দিয়ে সহজেই খুঁজে পাবেন।
        </p>
      </section>

      {/* Stats */}
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 p-5 text-center">
          <span className="font-bangla text-3xl font-bold tabular-nums text-white md:text-4xl">
            {formatBanglaCount(1800)}
          </span>
          <p className="font-bangla mt-1 text-sm text-white/70">বাংলা চটি গল্প</p>
        </div>
        <div className="rounded-lg border border-white/10 p-5 text-center">
          <span className="font-bangla text-3xl font-bold tabular-nums text-white md:text-4xl">
            {formatBanglaCount(1000)}
          </span>
          <p className="font-bangla mt-1 text-sm text-white/70">Bangla Sex Video</p>
        </div>
        <div className="rounded-lg border border-white/10 p-5 text-center">
          <span className="font-bangla text-3xl font-bold tabular-nums text-white md:text-4xl">
            {CATEGORIES.length}
          </span>
          <p className="font-bangla mt-1 text-sm text-white/70">বিভাগ</p>
        </div>
      </section>

      {/* Features */}
      <section className="netflix-section mb-8 rounded-lg border border-white/10 p-6 md:p-8">
        <h2 className="font-bangla text-lg font-bold text-white md:text-xl">
          কেন bongochoti?
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <li
              key={i}
              className="rounded-lg border border-white/10 p-4 transition-colors hover:border-white/20"
            >
              <h3 className="font-bangla font-semibold text-white">{f.title}</h3>
              <p className="font-bangla mt-1 text-sm text-white/75">{f.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories preview */}
      <section className="netflix-section mb-8 rounded-lg border border-white/10 p-6 md:p-8">
        <h2 className="font-bangla text-lg font-bold text-white md:text-xl">
          গল্প বিভাগ
        </h2>
        <p className="font-bangla mt-2 text-sm text-white/75">
          অজাচার, পরকিয়া, গৃহবধূ, কাজের মেয়ে, সেরা চটি সহ আরও অনেক বিভাগে গল্প পড়ুন।
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 10).map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}/`}
              className="font-bangla rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/90 transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              {c.label}
            </Link>
          ))}
          <Link
            href="/categories/"
            className="font-bangla rounded-md border border-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white"
          >
            সব বিভাগ →
          </Link>
        </div>
      </section>

      {/* Quick links */}
      <section className="netflix-section mb-8 rounded-lg border border-white/10 p-6 md:p-8">
        <h2 className="font-bangla text-lg font-bold text-white md:text-xl">
          দ্রুত লিংক
        </h2>
        <ul className="mt-4 space-y-3">
          <li>
            <Link
              href="/"
              className="font-bangla flex items-center gap-2 text-white/90 transition-colors hover:text-[var(--primary)]"
            >
              <span className="text-[var(--primary)]">→</span> হোম — Bangla Choti ও Sex Video
            </Link>
          </li>
          <li>
            <Link
              href="/categories/"
              className="font-bangla flex items-center gap-2 text-white/90 transition-colors hover:text-[var(--primary)]"
            >
              <span className="text-[var(--primary)]">→</span> Bangla Choti গল্প বিভাগ
            </Link>
          </li>
          <li>
            <Link
              href="/videos/"
              className="font-bangla flex items-center gap-2 text-white/90 transition-colors hover:text-[var(--primary)]"
            >
              <span className="text-[var(--primary)]">→</span> Sex Video / Bangla Porn Video
            </Link>
          </li>
          <li>
            <Link
              href="/search/"
              className="font-bangla flex items-center gap-2 text-white/90 transition-colors hover:text-[var(--primary)]"
            >
              <span className="text-[var(--primary)]">→</span> গল্প খুঁজুন
            </Link>
          </li>
          <li>
            <Link
              href="/blog/"
              className="font-bangla flex items-center gap-2 text-white/90 transition-colors hover:text-[var(--primary)]"
            >
              <span className="text-[var(--primary)]">→</span> ব্লগ — Bangla Choti Guide
            </Link>
          </li>
          <li>
            <Link
              href="/archive/"
              className="font-bangla flex items-center gap-2 text-white/90 transition-colors hover:text-[var(--primary)]"
            >
              <span className="text-[var(--primary)]">→</span> আর্কাইভ
            </Link>
          </li>
          <li>
            <Link
              href="/privacy/"
              className="font-bangla flex items-center gap-2 text-white/90 transition-colors hover:text-[var(--primary)]"
            >
              <span className="text-[var(--primary)]">→</span> গোপনীয়তা নীতি (Privacy Policy)
            </Link>
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="text-center">
        <div className="mb-4 flex flex-wrap justify-center gap-4">
          <Link
            href="/privacy/"
            className="font-bangla text-sm text-white/70 underline-offset-2 transition-colors hover:text-[var(--primary)] hover:underline"
          >
            গোপনীয়তা নীতি
          </Link>
          <span className="text-white/40">|</span>
          <Link
            href="/"
            className="font-bangla text-sm text-white/70 underline-offset-2 transition-colors hover:text-[var(--primary)] hover:underline"
          >
            হোম
          </Link>
        </div>
        <p className="font-bangla text-sm text-white/60">
          © bongochoti — Bangla choti golpo, choti kahini, bangla sex video, porn video।
        </p>
        <p className="font-bangla mt-1 text-xs text-white/50">
          প্রাপ্তবয়স্কদের জন্য। ১৮+ কন্টেন্ট।
        </p>
      </footer>
    </div>
  );
}
