import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export const metadata: Metadata = {
  title: "লাইব্রেরি — দেখা ভিডিও",
  description: "আপনার দেখা ভিডিওগুলোর তালিকা। Watched videos library.",
  alternates: { canonical: `${siteUrl}/library/` },
  robots: { index: true, follow: true },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
