# Terminal Commands: Crawl & Publish

Run these locally to fetch stories/videos, save to Firebase, and show them on your site.
**Only real Firestore data is shown** – no mock data.

## Full Stories (Multi-Page)

The crawler now follows all pages of each story (Part 1, Part 2, …) and concatenates them. If Firestore has old summary-only data, **delete and re-crawl**:

```bash
# 1. Delete existing stories (by category or all)
npm run delete:stories -- grihobodhur
# or delete ALL:  npm run delete:stories -- --all

# 2. Re-crawl with full multi-page support
npm run crawl:stories -- "https://www.banglachotikahinii.com/category/bangla-housewife-sex-story/" grihobodhur 50 --publish
```

## Setup

1. **Firebase credentials**: Place `service-account.json` in the project root, or set `GOOGLE_APPLICATION_CREDENTIALS` to its path.
2. **Firestore index** (for stories): On first run, Firestore may show a link to create an index for `stories` (status + publishedAt). Follow that link to create it.

---

## Stories (Choti Golpo)

### Example: Housewife category (গৃহবধূর চোদন কাহিনী)

```bash
npm run crawl:stories -- "https://www.banglachotikahinii.com/category/bangla-housewife-sex-story/" grihobodhur 50 --publish
```

Crawls the category page, visits each story page, extracts full text, saves to Firestore, and publishes.

---

### Crawl & save as draft

```bash
npm run crawl:stories
```

Defaults: URL = banglachotikahinii.com, category = sera, count = 10.

**Category slug mapping** (for `grihobodhur`, `sera`, etc.): Use slugs from `lib/stories.ts` CATEGORIES.

### With custom URL, category, count

```bash
npm run crawl:stories -- "https://www.banglachotikahinii.com/" seria 20
```

### Crawl and publish immediately (show on site)

```bash
npm run crawl:stories -- "https://www.banglachotikahinii.com/" seria 20 --publish
```

### Publish drafts only

```bash
# Publish all drafts
npm run publish:stories

# Publish drafts in one category
npm run publish:stories -- sera
```

---

## Videos

### Crawl BanglaChoti videos & save to Firestore

```bash
npm run crawl -- "https://www.banglachotikahinii.com/videos/latest-updates/" --banglachoti --save
```

**Important:** Use `--` before the URL so npm passes args to the script.

---

## Flow

1. **Stories**: `npm run crawl:stories -- ... --publish` → saves to Firestore → publishes → visible on home, categories, search, archive.
2. **Videos**: `npm run crawl -- "url" --banglachoti --save` → saves to Firestore → visible on /videos.

Both use the same Firebase project; the site reads from Firestore.
