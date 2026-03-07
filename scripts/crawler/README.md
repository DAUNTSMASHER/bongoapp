# Video Link Crawler

Fetches HTML from a URL and extracts all candidate video links (video, iframe, embed, anchor).

## Usage

```bash
# Crawl a page (prints links to console)
npm run crawl -- https://example.com/some-page

# Crawl and save to Firestore
npm run crawl:save -- https://example.com/some-page
```

## Firestore Setup

1. Download a service account key from [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts.
2. Save as `service-account.json` in the project root, or set `GOOGLE_APPLICATION_CREDENTIALS` to its path.

## Extending

- **Known video domains**: Edit `KNOWN_VIDEO_DOMAINS` in `crawlVideoLinks.ts`.
- **More filters**: Add checks in `isVideoLikeHref()`.
- **SSL issues (dev)**: If you see `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, try `NODE_TLS_REJECT_UNAUTHORIZED=0` (dev only).
