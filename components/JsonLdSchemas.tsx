import { SEO_KEYWORDS } from "@/lib/seoKeywords";

/** Server-rendered JSON-LD so crawlers see structured data in initial HTML. */
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

const baseUrl = siteUrl.replace(/\/$/, "");
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bangla Choti | bongochoti",
  alternateName: ["Bangla Choti", "বাংলা চটি", "bangla choti", "bangla choti golpo", "choti kahini", "bangla sex video", "sex video", "bongochoti"],
  url: `${baseUrl}/`,
  description: "Bangla choti — ১৮০০+ bangla choti golpo, choti kahini পড়ুন। ১০০০+ bangla sex video। বাংলা চটি গল্প free online.",
  inLanguage: "bn",
  keywords: SEO_KEYWORDS.join(", "),
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/search/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "bongochoti",
    logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png`, width: 512, height: 512 },
  },
};

/** Organization schema with Wikipedia-style description for Knowledge Panel / rich results. */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${baseUrl}/#organization`,
  name: "bongochoti — Bangla Choti",
  alternateName: ["Bangla Choti", "বাংলা চটি", "bangla choti", "bangla choti golpo", "choti kahini", "bangla sex video", "sex video"],
  url: `${baseUrl}/`,
  logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png`, width: 512, height: 512 },
  description:
    "bongochoti হল bangla choti ও bangla choti golpo প্ল্যাটফর্ম। ১৮০০+ বাংলা চটি গল্প, choti kahini, ১০০০+ bangla sex video। Read bangla choti kahini, watch bangla porn video.",
  inLanguage: "bn",
  knowsAbout: SEO_KEYWORDS,
  sameAs: [
    "https://pin.it/6JrgTZObS",
    "https://www.facebook.com/profile.php?id=61582754621127",
    "https://bongochoti.tumblr.com",
  ],
};

/** ItemList for homepage – rich results for "bangla choti", "sex video" queries. */
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Bangla Choti | বাংলা চটি গল্প ও Sex Video",
  description: "১৮০০+ bangla choti golpo, choti kahini। ১০০০+ bangla sex video।",
  url: `${baseUrl}/`,
  numberOfItems: 2800,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Bangla Choti — সব গল্প", url: `${baseUrl}/stories/` },
    { "@type": "ListItem", position: 2, name: "Bangla Choti বিভাগ", url: `${baseUrl}/categories/` },
    { "@type": "ListItem", position: 3, name: "Bangla Sex Video", url: `${baseUrl}/videos/` },
    { "@type": "ListItem", position: 4, name: "Blog — Bangla Choti Guide", url: `${baseUrl}/blog/` },
  ],
};

/** Breadcrumb for homepage – helps Google show tabs/navigation in SERP. */
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Bangla Choti | হোম", item: `${baseUrl}/` },
    { "@type": "ListItem", position: 2, name: "Bangla Choti গল্প", item: `${baseUrl}/stories/` },
    { "@type": "ListItem", position: 3, name: "বিভাগ", item: `${baseUrl}/categories/` },
    { "@type": "ListItem", position: 4, name: "Sex Video", item: `${baseUrl}/videos/` },
    { "@type": "ListItem", position: 5, name: "আর্কাইভ", item: `${baseUrl}/archive/` },
    { "@type": "ListItem", position: 6, name: "খুঁজুন", item: `${baseUrl}/search/` },
    { "@type": "ListItem", position: 7, name: "ব্লগ", item: `${baseUrl}/blog/` },
  ],
};

/** FAQ schema – helps with featured snippets for bangla choti queries. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Bangla Choti?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bangla choti is Bengali adult fiction. bongochoti offers 1800+ bangla choti golpo, choti kahini, panu golpo. Read bangla choti kahini and watch 1000+ bangla sex video online. Free bangla choti.",
      },
    },
    {
      "@type": "Question",
      name: "Where to read Bangla Choti Golpo online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "bongochoti.com is the best site for bangla choti golpo. Browse 1800+ bangla choti stories by category — choti kahini, panu golpo, বাংলা চটি গল্প. Free bangla choti.",
      },
    },
    {
      "@type": "Question",
      name: "Bangla Choti — best site?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "bongochoti offers bangla choti, bangla choti golpo, choti kahini, and bangla sex video. 1800+ stories, 1000+ videos. Visit bongochoti.com for bangla choti.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I watch Bangla Sex Video?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "bongochoti has 1000+ bangla sex video and bangla porn video. Browse at bongochoti.com/videos. All content is 18+.",
      },
    },
    {
      "@type": "Question",
      name: "বাংলা চটি গল্প কিভাবে পড়ব?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "bongochoti.com এ গিয়ে হোম, বিভাগ বা আর্কাইভ থেকে bangla choti golpo নির্বাচন করুন। সব গল্প বিনামূল্যে পড়া যায়।",
      },
    },
    {
      "@type": "Question",
      name: "Is bangla choti free to read?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. bongochoti.com offers free bangla choti golpo and choti kahini. No registration required. 1800+ stories, 1000+ videos.",
      },
    },
  ],
};

export default function JsonLdSchemas() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
