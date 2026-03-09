/** Server-rendered JSON-LD so crawlers see structured data in initial HTML. */
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

const baseUrl = siteUrl.replace(/\/$/, "");
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "bongochoti",
  alternateName: ["বাংলা চটি", "Bangla Choti", "bangla choti golpo", "bangla sex video", "sex video"],
  url: `${baseUrl}/`,
  description: "Bangla choti golpo, choti kahini পড়ুন। Bangla sex video, porn video দেখুন। ১৮০০+ গল্প, ১০০০+ ভিডিও।",
  inLanguage: "bn",
  keywords: "bangla choti, sex video, bangla sex video, bangla porn video, choti golpo, choti kahini",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/search/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "bongochoti",
    logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
  },
};

/** Organization schema with Wikipedia-style description for Knowledge Panel / rich results. */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${baseUrl}/#organization`,
  name: "bongochoti",
  alternateName: ["বাংলা চটি", "Bangla Choti", "bangla sex video", "sex video"],
  url: `${baseUrl}/`,
  logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png` },
  description:
    "bongochoti হল bangla choti golpo ও sex video প্ল্যাটফর্ম। ১৮০০+ বাংলা চটি গল্প, ১০০০+ bangla porn video। Bangla choti kahini পড়ুন, bangla sex video দেখুন।",
  inLanguage: "bn",
  knowsAbout: ["বাংলা চটি", "bangla choti", "choti golpo", "choti kahini", "sex video", "bangla sex video", "bangla porn video"],
};

/** ItemList for homepage – rich results for "bangla choti", "sex video" queries. */
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Bangla Choti গল্প ও Sex Video",
  description: "১৮০০+ bangla choti golpo, ১০০০+ bangla sex video।",
  url: `${baseUrl}/`,
  numberOfItems: 2800,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Bangla Choti গল্প", url: `${baseUrl}/categories/` },
    { "@type": "ListItem", position: 2, name: "Sex Video / Bangla Porn Video", url: `${baseUrl}/videos/` },
  ],
};

/** Breadcrumb for homepage – helps Google show tabs/navigation in SERP. */
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "হোম", item: `${baseUrl}/` },
    { "@type": "ListItem", position: 2, name: "গল্প", item: `${baseUrl}/categories/` },
    { "@type": "ListItem", position: 3, name: "ভিডিও", item: `${baseUrl}/videos/` },
    { "@type": "ListItem", position: 4, name: "আর্কাইভ", item: `${baseUrl}/archive/` },
    { "@type": "ListItem", position: 5, name: "খুঁজুন", item: `${baseUrl}/search/` },
  ],
};

/** FAQ schema – helps with featured snippets for bangla choti / sex video queries. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Bangla Choti?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bangla choti is Bengali adult fiction. bongochoti offers 1800+ bangla choti golpo, choti kahini, and 1000+ bangla sex video. Read bangla choti kahini and watch bangla porn video online.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I read Bangla Choti Golpo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "bongochoti is a platform for bangla choti golpo and sex video. Browse categories, search stories, and watch bangla sex video. Visit bongochoti.online for bangla choti kahini and porn video.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I watch Bangla Sex Video?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "bongochoti has 1000+ bangla sex video and porn video. Browse videos at bongochoti.online/videos. All content is 18+.",
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
