# Google Optimization Audit

Issues identified from Google PageSpeed Insights rules, Core Web Vitals, and codebase review. Fix in order.

---

## 1. SSL Certificate (Infrastructure – FIXED)

**Issue:** `net::ERR_CERT_COMMON_NAME_INVALID` when accessing `https://www.bongochoti.online`.

**Status:** Resolved. Both apex and www have valid SSL (verified via curl). Ensure both domains remain in Vercel → Domains.

---

## 1b. Security headers (Code – FIXED)

**Fix applied:** Migrated to Next.js 16 `proxy.ts` (replaces deprecated `middleware.ts`). Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection, Strict-Transport-Security. Static assets and API routes excluded via matcher.

---

## 2. Image Optimization (Code – FIXED)

**Issue:** `next.config.ts` had `images: { unoptimized: true }` – no WebP/AVIF, no resizing.

**Impact:** Larger images, slower LCP, worse Core Web Vitals.

**Fix applied:** Removed `unoptimized`, added `remotePatterns` for Firebase Storage (`firebasestorage.googleapis.com`, `*.firebasestorage.app`, `lh3.googleusercontent.com`). Add more domains if cover images come from other hosts.

---

## 3. JSON-LD in Client Component (Code – FIXED)

**Issue:** `JsonLdSchemas` was a client component – structured data could load after JS.

**Fix applied:** Removed `"use client"` so it’s server-rendered and included in the initial HTML.

---

## 4. LCP Hero Image (Code – OK)

**Status:** HeroBanner uses `priority` on the hero Image, which sets `fetchpriority="high"`. Good.

---

## 5. Font Preloading (Code – FIXED)

**Issue:** Kalpurush was loaded via `@font-face` but not preloaded.

**Fix applied:** Added `<link rel="preload" href="/fonts/kalpurush.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />` in layout body.

---

## 6. Cumulative Layout Shift (Code – MONITOR)

**Status:** Images use `fill` with `aspect-[2/3]` containers. Layout is generally stable. Monitor CLS in production.

---

## 7. Animation / INP (Code – FIXED)

**Issue:** Framer Motion on many cards can add main-thread work and affect INP.

**Fix applied:** Wrapped app in `MotionConfig reducedMotion="user"` so animations are disabled for users who prefer reduced motion (accessibility + INP improvement).

---

## 8. GA Script Loading (Code – OK)

**Status:** gtag uses `strategy="afterInteractive"` – non-blocking. Good.

---

## 9. Bundle & config (Code – FIXED)

- **poweredByHeader: false** in next.config to reduce header footprint.
- **optimizePackageImports: ["framer-motion"]** to tree-shake framer-motion.
- **images.deviceSizes / imageSizes** tuned for responsive cover images.
- **HotChobiRail** and **HomeStats** loaded via `next/dynamic` with `ssr: true` to split initial client bundle while keeping SSR.

## 10. Caching (Code – FIXED)

- **API routes** `/api/stories`, `/api/stories/[id]`, `/api/videos`, `/api/videos/[id]`: `export const revalidate = 60` and `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`.
- **Server data layer** `lib/storyData.ts`: `getPublishedStories` and `getPublishedStoryById` wrapped with `unstable_cache(..., { revalidate: 60 })` to reduce Firestore reads.

## 11. LCP (Code – FIXED)

- **Preconnect** in layout to `firebasestorage.googleapis.com` and `lh3.googleusercontent.com` so hero cover images start loading earlier.
- **Hero image**: `fetchPriority="high"` and `loading="eager"` in addition to `priority` for faster LCP discovery.
- **Note:** Lighthouse run showed LCP ~7.6s (redirect apex→www adds latency). Preconnect and eager hero help; consider canonical redirect (e.g. www→apex only) to avoid double round-trip.

---

## Already Good

- ✅ `font-display: swap` on Kalpurush
- ✅ Server-rendered homepage (dynamic)
- ✅ Canonical URLs, meta description, Open Graph
- ✅ Sitemap, robots.txt
- ✅ JSON-LD WebSite + Organization
- ✅ `lang="bn"` on html
