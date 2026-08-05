import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/profile/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
