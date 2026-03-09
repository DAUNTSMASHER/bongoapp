# Organic Search Volume: How to Increase & Track Performance

This guide covers how to grow organic traffic and **authentic sources** where you can measure performance before and after changes.

---

## Authentic Sources to Track Before/After

Use these official, free tools to see real impact. All are from Google, Microsoft, or trusted third parties.

| Source | What It Measures | URL | Best For |
|--------|------------------|-----|----------|
| **Google Search Console** | Clicks, impressions, CTR, average position, queries, indexing | [search.google.com/search-console](https://search.google.com/search-console) | Organic search visibility on Google |
| **Google Analytics 4** | Sessions, users, engagement, traffic sources | [analytics.google.com](https://analytics.google.com) | On-site behavior, conversions, all traffic |
| **Google PageSpeed Insights** | Core Web Vitals, performance, SEO | [pagespeed.web.dev](https://pagespeed.web.dev) | Speed & UX impact on rankings |
| **Bing Webmaster Tools** | Clicks, impressions on Bing | [bing.com/webmasters](https://www.bing.com/webmasters) | Bing organic traffic |
| **Lighthouse (Chrome DevTools)** | Performance, Accessibility, SEO, Best Practices | DevTools → Lighthouse | Local audits before deploy |

### Recommended Workflow

1. **Before changes**: Note current values in Search Console (Performance → Total clicks, impressions, avg position) and GA4 (Acquisition → Traffic acquisition → organic).
2. **Make SEO changes** (see below).
3. **After 2–4 weeks**: Compare the same metrics. Search Console data lags ~48 hours.
4. **Use PageSpeed Insights** on `https://bongochoti.online` (apex, not www) for Core Web Vitals before/after.

### Connect Search Console to GA4

Link GSC and GA4 to see organic search data in one place:
- GA4: Admin → Product Links → Search Console Links → Link
- [Google Help: Connect Search Console to Analytics](https://support.google.com/analytics/answer/10737381)

---

## How to Increase Organic Search Volume

### 1. Technical SEO (Quick Wins)

- **Fix SSL for www**: Ensure `www.bongochoti.online` has valid SSL. Vercel → Domains → add `www.bongochoti.online` and enable SSL.
- **Canonical URLs**: Already set on main pages ✅
- **Sitemap**: Already submitted at `https://bongochoti.online/sitemap.xml` ✅
- **robots.txt**: Already configured ✅

### 2. Content & On-Page SEO

- **Target user intent**: Map content to “search for bangla choti,” “watch bangla sex video,” etc.
- **Unique meta descriptions** (≤155 chars) per story and category.
- **Structured data**: Article, WebSite, Organization, BreadcrumbList ✅; add FAQ and Video where relevant.

### 3. Core Web Vitals

- Optimize LCP (hero image `priority` ✅)
- Reduce CLS (stable layout for images)
- Improve INP (minimize heavy JS on main thread; reduced-motion ✅)

### 4. Content Strategy

- **Topic clusters**: Pillar pages (e.g. /categories/, /videos/) with cluster content (stories, videos).
- **Internal linking**: Link related stories and categories from homepage and category pages.
- **Fresh content**: Regular new stories/videos.

### 5. E-E-A-T (Experience, Expertise, Authoritativeness, Trust)

- Author/publisher info on stories
- Clear About page
- Quality, original content

### 6. Backlinks

- See `docs/BACKLINKS-SEO.md` for ideas (directories, social, guest posts).

---

## Timeline for Results

| Change Type | Expected Impact |
|-------------|-----------------|
| Technical fixes, meta tags | 1–4 weeks |
| Low-competition keywords | 1–3 months |
| Strong ranking gains | 3–6+ months |

---

## Before/After Checklist

When making SEO changes:

- [ ] Screenshot Search Console Performance (clicks, impressions) for the date range before changes
- [ ] Note GA4 organic sessions for the same period
- [ ] Run PageSpeed Insights on homepage and a story page
- [ ] Implement changes
- [ ] Wait 2–4 weeks
- [ ] Compare same metrics in Search Console and GA4
- [ ] Re-run PageSpeed Insights
