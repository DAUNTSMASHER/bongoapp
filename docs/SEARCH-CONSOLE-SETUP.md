# Google Search Console & Sitemap Setup

Submit your sitemap so Google can discover and index your pages faster.

## 1. Add your site to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click **Add property**
4. Choose **URL prefix** and enter your site: `https://bongochoti.online` (or your production URL)
5. Verify ownership using one of these methods:
   - **HTML tag**: Add the meta tag to your site (we can add this if you use the HTML method)
   - **DNS**: Add a TXT record to your domain
   - **Google Analytics**: If GA4 is already set up, you can verify via that

## 2. Submit your sitemap

1. After verification, open your property in Search Console
2. In the left sidebar, click **Sitemaps**
3. Under "Add a new sitemap", enter: `sitemap.xml`
4. Click **Submit**

Your full sitemap URL is: `https://bongochoti.online/sitemap.xml`

## 3. What happens next

- Google will crawl your sitemap and discover all listed URLs
- Indexing can take a few days to weeks depending on site size and authority
- Check **Coverage** and **Performance** in Search Console to monitor progress

## 4. Optional: Request indexing for important pages

For specific pages you want indexed faster:

1. Go to **URL Inspection** in the left sidebar
2. Enter the page URL
3. Click **Request indexing**

---

## 5. Track organic search performance (before/after SEO changes)

**Google Search Console** is the authentic source for organic search data:

- **Performance** report: Clicks, Impressions, CTR, Average position
- **Queries**: Which search terms bring traffic
- **Pages**: Which URLs get the most clicks

**Connect to GA4** for combined view: Admin → Product Links → Search Console Links.

See `docs/ORGANIC-SEARCH-GUIDE.md` for full list of tracking tools (PageSpeed Insights, Bing Webmaster, etc.) and how to measure before/after SEO changes.
