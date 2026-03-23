import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/submit-to-search-engines
 * One-click: submits sitemap to Google Search Console + IndexNow (Bing/Yahoo/Yandex)
 * Also supports submitting individual URLs.
 *
 * Body: { action: "sitemap" | "urls", urls?: string[] }
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.bongochoti.com";
const INDEXNOW_KEY = "b3c7a9f2e1d4a8b6c5f0e3d7a2b8c4f1";

async function getGoogleAuth() {
  const { google } = await import("googleapis");
  const { db } = await import("@/lib/firebaseAdmin");

  // 1. Try OAuth2 Refresh Token from Firestore
  const configDoc = await db.collection("config").doc("marketing").get();
  const config = configDoc.data();

  if (config?.googleRefreshToken) {
    const { getOAuth2Client } = await import("@/lib/googleAuth");
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: config.googleRefreshToken });
    return { google, auth: oauth2Client };
  }

  // 2. Fallback to Service Account
  let sa: any = {};
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
  } catch (e) {
    console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT env var, falling back to file...");
  }

  if (!sa.client_email || !sa.private_key) {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "service-account.json");
      const fileData = await fs.readFile(filePath, "utf-8");
      sa = JSON.parse(fileData);
    } catch (e) {
      console.error("Failed to read service-account.json file:", e);
    }
  }

  if (sa.client_email && sa.private_key) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: sa.client_email,
        private_key: sa.private_key.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/webmasters"],
    });
    return { google, auth };
  }

  throw new Error("Google Search Console credentials missing (OAuth or Service Account)");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = body.action || "sitemap";
  const results: { engine: string; status: string; ok: boolean; detail?: string }[] = [];

  // ========================
  // 1. Google Search Console — Submit Sitemap
  // ========================
  if (action === "sitemap") {
    try {
      const { google, auth } = await getGoogleAuth();
      const searchconsole = google.searchconsole({ version: "v1", auth });

      const siteUrl = SITE_URL.endsWith("/") ? SITE_URL : `${SITE_URL}/`;
      const sitemapUrl = `${SITE_URL}/sitemap.xml`;

      // Submit sitemap via Search Console API
      await searchconsole.sitemaps.submit({
        siteUrl: siteUrl,
        feedpath: sitemapUrl,
      });

      results.push({ engine: "Google Search Console", status: "Sitemap submitted", ok: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // If site not verified, give helpful message
      if (msg.includes("403") || msg.includes("User does not have sufficient permission")) {
        results.push({
          engine: "Google Search Console",
          status: "Permission denied",
          ok: false,
          detail: "Add your Firebase service account email as Owner in Google Search Console → Settings → Users",
        });
      } else if (msg.includes("404")) {
        results.push({
          engine: "Google Search Console",
          status: "Site not found in GSC",
          ok: false,
          detail: `Add ${SITE_URL} as a property in Google Search Console first`,
        });
      } else {
        results.push({ engine: "Google Search Console", status: "Error", ok: false, detail: msg });
      }
    }

    // Also do the basic Google ping as fallback
    try {
      const pingRes = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`
      );
      results.push({ engine: "Google Ping", status: `Pinged (${pingRes.status})`, ok: pingRes.ok });
    } catch {
      results.push({ engine: "Google Ping", status: "Failed", ok: false });
    }
  }

  // ========================
  // 2. IndexNow — Bing, Yahoo, Yandex, DuckDuckGo
  // ========================
  const urlsToSubmit = action === "urls" && Array.isArray(body.urls) 
    ? body.urls 
    : [`${SITE_URL}/`, `${SITE_URL}/stories/`, `${SITE_URL}/videos/`, `${SITE_URL}/sitemap.xml`];

  // Submit to all IndexNow engines
  const indexNowEngines = [
    { name: "Bing / Yahoo", endpoint: "https://www.bing.com/indexnow" },
    { name: "Yandex", endpoint: "https://yandex.com/indexnow" },
  ];

  for (const engine of indexNowEngines) {
    try {
      const res = await fetch(engine.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: new URL(SITE_URL).hostname,
          key: INDEXNOW_KEY,
          keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: urlsToSubmit,
        }),
      });

      results.push({
        engine: engine.name,
        status: res.ok || res.status === 200 || res.status === 202 
          ? `Submitted ${urlsToSubmit.length} URLs` 
          : `Status ${res.status}`,
        ok: res.ok || res.status === 200 || res.status === 202,
      });
    } catch (err) {
      results.push({
        engine: engine.name,
        status: "Failed",
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const allOk = results.every((r) => r.ok);
  return NextResponse.json({ ok: allOk, results });
}
