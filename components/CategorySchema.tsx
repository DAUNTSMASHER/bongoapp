interface CategorySchemaProps {
  label: string;
  slug: string;
  siteUrl: string;
}

export default function CategorySchema({ label, slug, siteUrl }: CategorySchemaProps) {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} | Bangla Choti — বাংলা চটি গল্প`,
    description: `Browse all stories in the ${label} category. Read latest bangla choti golpo, choti kahini online.`,
    url: `${siteUrl}/categories/${slug}/`,
    isPartOf: {
      "@type": "WebSite",
      name: "bongochoti",
      url: siteUrl,
    },
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", position: 1, name: "হোম", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "বিভাগ", item: `${siteUrl}/categories/` },
        { "@type": "ListItem", position: 3, name: label, item: `${siteUrl}/categories/${slug}/` }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
    />
  );
}
