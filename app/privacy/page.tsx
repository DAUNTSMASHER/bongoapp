import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  title: "Privacy Policy | bongochoti — Bangla Choti & Sex Video",
  description:
    "bongochoti Privacy Policy — Data collection, cookies, ads, user data. Bangla choti golpo ও sex video প্ল্যাটফর্মের গোপনীয়তা নীতি। bongochoti.com",
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${siteUrl}/privacy/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Privacy Policy | bongochoti",
    description: "bongochoti গোপনীয়তা নীতি — Data, cookies, ads. Privacy policy for Bangla Choti platform.",
    url: `${siteUrl}/privacy/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Privacy Policy | bongochoti" }],
  },
  twitter: { card: "summary_large_image", title: "Privacy Policy | bongochoti" },
};

const SECTIONS = [
  {
    title: "সাধারণ তথ্য",
    content:
      "bongochoti একটি বাংলা চটি গল্প ও sex video প্ল্যাটফর্ম। আমরা আপনার গোপনীয়তা গুরুত্ব সহকারে নিই। এই নীতি অনুযায়ী আমরা কোন তথ্য সংগ্রহ করি এবং কীভাবে ব্যবহার করি তা বর্ণনা করা হয়েছে।",
  },
  {
    title: "তথ্য সংগ্রহ",
    content:
      "আমরা আপনার ব্রাউজিং তথ্য যেমন পেজ ভিউ, ক্লিক, ডিভাইস টাইপ, IP ঠিকানা (এননিমাইজড) সংগ্রহ করতে পারি। আপনি যদি লগইন করেন তবে ইমেইল সংগ্রহ হতে পারে। এই তথ্য কন্টেন্ট সরবরাহ, এ্যানালিটিক্স এবং বিজ্ঞাপন প্রদর্শনের জন্য ব্যবহার করা হয়।",
  },
  {
    title: "কুকিজ ও ট্র্যাকিং",
    content:
      "আমরা কুকিজ, লোকাল স্টোরেজ এবং সেশন স্টোরেজ ব্যবহার করি — থিম পছন্দ, ওয়াচড ভিডিও তালিকা, এবং ব্যবহারের পরিসংখ্যান সংরক্ষণের জন্য। তৃতীয় পক্ষের বিজ্ঞাপন সেবা (যেমন Adsterra) তাদের নিজস্ব কুকিজ ও ট্র্যাকিং ব্যবহার করতে পারে।",
  },
  {
    title: "বিজ্ঞাপন",
    content:
      "সাইটে বিজ্ঞাপন প্রদর্শিত হয়। বিজ্ঞাপন প্রদানকারীরা আপনার আগ্রহ অনুযায়ী বিজ্ঞাপন দেখাতে তাদের নিজস্ব প্রযুক্তি ব্যবহার করতে পারে। বিজ্ঞাপন সংক্রান্ত নীতির জন্য সংশ্লিষ্ট বিজ্ঞাপন নেটওয়ার্কের ওয়েবসাইট দেখুন।",
  },
  {
    title: "তথ্য ভাগাভাগি",
    content:
      "আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না। আমরা কেবল সাইট চালানোর জন্য প্রয়োজনীয় সেবা (হোস্টিং, এ্যানালিটিক্স, বিজ্ঞাপন) ব্যবহার করি। আইনগত বাধ্যবাধকতা ছাড়া আমরা তথ্য শেয়ার করি না।",
  },
  {
    title: "ডেটা সুরক্ষা",
    content:
      "আমরা সাধারণ নিরাপত্তা অনুশীলন অনুসরণ করি। তবে ইন্টারনেটে কোনো ট্রান্সমিশন পুরোপুরি নিরাপদ নয়। আপনি আমাদের সাইট ব্যবহার করে এই সীমাবদ্ধতা মেনে নিচ্ছেন।",
  },
  {
    title: "১৮+ কন্টেন্ট",
    content:
      "এই সাইট প্রাপ্তবয়স্কদের জন্য। আপনি নিশ্চিত করছেন যে আপনার বয়স ১৮ বছর বা তার বেশি। আমরা শিশুদের তথ্য জেনে শুনে সংগ্রহ করি না।",
  },
  {
    title: "নীতিতে পরিবর্তন",
    content:
      "আমরা যেকোনো সময় এই গোপনীয়তা নীতি আপডেট করতে পারি। পরিবর্তন এই পেজে পোস্ট করা হবে। নিয়মিত পরিদর্শন করুন।",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      <header className="mb-12 text-center">
        <Link href="/" className="inline-block">
          <Logo size={80} showText />
        </Link>
        <h1 className="font-bangla mt-6 text-2xl font-bold text-white md:text-3xl">
          গোপনীয়তা নীতি (Privacy Policy)
        </h1>
        <p className="font-bangla mt-2 text-sm text-white/70">
          শেষ আপডেট: {new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </header>

      <section className="netflix-section space-y-8 rounded-lg border border-white/10 p-6 md:p-8">
        {SECTIONS.map((s, i) => (
          <div key={i}>
            <h2 className="font-bangla text-lg font-semibold text-white md:text-xl">
              {s.title}
            </h2>
            <p className="font-bangla mt-2 leading-relaxed text-white/85">
              {s.content}
            </p>
          </div>
        ))}
      </section>

      <footer className="mt-12 flex flex-wrap justify-center gap-4 border-t border-white/10 pt-8">
        <Link
          href="/about/"
          className="font-bangla text-sm text-white/80 underline-offset-2 transition-colors hover:text-[var(--primary)] hover:underline"
        >
          আমাদের সম্পর্কে
        </Link>
        <Link
          href="/"
          className="font-bangla text-sm text-white/80 underline-offset-2 transition-colors hover:text-[var(--primary)] hover:underline"
        >
          হোম
        </Link>
        <Link
          href="/categories/"
          className="font-bangla text-sm text-white/80 underline-offset-2 transition-colors hover:text-[var(--primary)] hover:underline"
        >
          বিভাগ
        </Link>
      </footer>

      <p className="font-bangla mt-8 text-center text-xs text-white/50">
        © bongochoti — Bangla choti golpo, sex video। প্রাপ্তবয়স্কদের জন্য।
      </p>
    </div>
  );
}
