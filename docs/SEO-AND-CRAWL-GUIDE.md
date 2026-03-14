# SEO & Crawl Guide — bongochoti.com

This guide explains how to crawl new stories and optimize your site for search rankings.

---

## 1. Crawling New Stories

### Option A: Admin Dashboard (Vercel / Production)

1. Go to **https://www.bongochoti.com/admin/**
2. Log in with your admin account
3. Open the **Stories** tab
4. Under **Smart Crawl**, enter:
   - **URL**: A listing page (e.g. `https://www.banglachotikahinii.com/`)
   - **Category**: e.g. `sera`, `ojachar`, `kajer-masi` (see categories below)
   - **Count**: 10–30
5. Click **Crawl**

**Required:** Add `FIRECRAWL_API_KEY` in Vercel Environment Variables. Get a key at [firecrawl.dev](https://firecrawl.dev).

### Option B: Run Locally (Recommended for Large Crawls)

```bash
# Install Chrome for Puppeteer (first time only)
npm run puppeteer:install

# Crawl from default source (banglachotikahinii.com), category "sera", 20 stories
npm run crawl:best

# Custom: URL, category, count
npm run crawl:best -- https://www.banglachotikahinii.com/ ojachar 30

# Publish immediately after crawl
npm run crawl:best -- https://www.banglachotikahinii.com/ sera 15 --publish
```

### Categories (categorySlug)

| Slug | Label |
|------|-------|
| sera | সেরা বাংলা চটি |
| ojachar | অজাচার বাংলা চটি গল্প |
| kajer-masi | কাজের মাসি চোদার গল্প |
| kajer-meye | কাজের মেয়ে চোদার গল্প |
| kumari-meye | কুমারী মেয়ে চোদার গল্প |
| grihobodhur | গৃহবধূর চোদন কাহিনী |
| porokia | পরকিয়া বাংলা চটি গল্প |
| bandhobi | বান্ধবী চোদার বাংলা চটি |
| group-sex | গ্রুপ সেক্সের বাংলা চটি গল্প |
| swami-strir | স্বামী স্ত্রীর বাংলা চটি গল্প |
| students | স্টুডেন্টস বাংলা চটি গল্প |
| ... | See `lib/stories.ts` for full list |

### Option C: Crawl from Pasted URLs

1. Admin Dashboard → Stories tab
2. **Crawl from Links** section
3. Paste story URLs (one per line or comma-separated)
4. Select category and click **Crawl**

---

## 2. SEO Checklist

### Already Implemented ✓

- **Meta tags**: Title, description, keywords on all pages
- **Canonical URLs**: No duplicate content
- **Open Graph & Twitter cards**: Good social sharing
- **JSON-LD schemas**: WebSite, Organization, FAQPage, Article, BreadcrumbList
- **Sitemap**: `/sitemap.xml` with all pages
- **Robots.txt**: Allows crawlers, blocks /admin/, /api/
- **Structured data**: Article schema on story pages with wordCount, articleSection

### You Should Do

1. **Google Search Console**
   - Add property: https://www.bongochoti.com
   - Submit sitemap: `https://www.bongochoti.com/sitemap.xml`
   - Use URL Inspection to request indexing for new stories

2. **Bing Webmaster Tools**
   - Add site and submit sitemap
   - Helps with Bing and DuckDuckGo

3. **Google Site Verification**
   - Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to Vercel env with your meta tag content value

4. **Mobile & Core Web Vitals**
   - Run Lighthouse in Chrome DevTools
   - Fix any performance/accessibility issues

5. **Internal Linking**
   - Homepage links to categories, archive, stories
   - Category pages link to stories
   - Add "Related stories" on story pages (if not already)

6. **Content**
   - Publish new stories regularly
   - Use varied titles that include target keywords (bangla choti golpo, choti kahini, etc.)
   - Keep stories 800+ characters for quality

---

## 3. Ranking Tips

- **Title**: Include primary keyword (e.g. "bangla choti golpo") in first 60 chars
- **Description**: 150–160 chars, include 2–3 keywords naturally
- **URLs**: Use story slug (Bangla + ID) — already done
- **Images**: Alt text with story title — covers use alt
- **Speed**: Site uses Next.js ISR; ensure Vercel region is close to users

---

## 4. Getting All Pages Indexed on Google

### Submit Sitemap
1. Google Search Console → Sitemaps
2. Add: `https://www.bongochoti.com/sitemap.xml`
3. Request indexing

### Request Indexing for New Pages
- Search Console → URL Inspection → paste URL → Request Indexing
- Do this for new story URLs and blog posts after publishing

### Backlinks (External Sites Linking to You)
- See **`docs/backlink-posts/`** — ready-to-publish Blogger posts that link to bongochoti.com
- Post on Blogger (blogspot.com), Medium, or WordPress.com
- Each backlink helps Google discover and rank your pages higher

---

## 5. After Deploying or Publishing

1. Submit sitemap in Search Console
2. Request indexing for new story URLs (optional, speeds up discovery)
3. Share new stories on social to get backlinks

---

## 6. Troubleshooting

**Crawl fails on Vercel:** Ensure `FIRECRAWL_API_KEY` is set. Non-smart crawl is not supported on Vercel.

**Chrome not found locally:** Run `npm run puppeteer:install`

**403 from source sites:** Use Smart Crawl with Firecrawl, or run locally with Puppeteer.
