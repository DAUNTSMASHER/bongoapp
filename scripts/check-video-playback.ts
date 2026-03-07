/**
 * Check if videos in Firestore can play.
 * Run: npx tsx scripts/check-video-playback.ts
 * Optional: npm run dev (in another terminal) to also test the video-proxy.
 *
 * Requires: service-account.json or GOOGLE_APPLICATION_CREDENTIALS
 */

import { initFirestore } from "./crawler/saveToFirestore";

const PROXY_BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function main() {
  console.log("══════════════════════════════════════════════════════════");
  console.log("  VIDEO PLAYBACK CHECK");
  console.log("══════════════════════════════════════════════════════════\n");

  const firestore = initFirestore();
  const snap = await firestore.collection("videos").where("status", "==", "active").limit(10).get();

  if (snap.empty) {
    console.log("No videos in Firestore. Crawl some first via /admin/dashboard");
    process.exit(0);
    return;
  }

  console.log(`Found ${snap.size} video(s). Checking playback options...\n`);

  let withDirect = 0;
  let withEmbed = 0;
  let withOutbound = 0;
  let proxyOk = 0;
  let directUrlOk = 0;
  let outboundOk = 0;

  const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  for (let i = 0; i < snap.docs.length; i++) {
    const doc = snap.docs[i];
    const d = doc.data();
    const id = doc.id;
    const title = (d.title || "Video").slice(0, 50);
    const direct = d.directVideoUrl as string | undefined;
    const embed = d.embedUrl as string | undefined;
    const outbound = d.outboundUrl as string | undefined;

    if (direct) withDirect++;
    if (embed) withEmbed++;
    if (outbound) withOutbound++;

    console.log(`[${i + 1}/${snap.docs.length}] ${title}...`);
    console.log(`   ID: ${id}`);
    console.log(`   directVideoUrl: ${direct ? "✓ " + direct.slice(0, 60) + "..." : "✗ missing"}`);
    console.log(`   embedUrl:       ${embed ? "✓ " + embed.slice(0, 60) + "..." : "✗ missing"}`);
    console.log(`   outboundUrl:    ${outbound ? "✓ " + outbound.slice(0, 60) + "..." : "✗ missing"}`);

    // Test outboundUrl (external link - does the page load when user clicks?)
    if (outbound) {
      try {
        const origin = new URL(outbound).origin;
        const res = await fetch(outbound, {
          method: "GET",
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
            Referer: origin + "/",
          },
          signal: AbortSignal.timeout(10000),
          redirect: "follow",
        });
        if (res.ok) {
          const html = await res.text();
          const hasVideoMarkup = /<video|<iframe|<embed|get_file|\.mp4|player/i.test(html);
          const hasErrorMsg = /media play link is not found|video not found|404 not found|page not found/i.test(html);
          outboundOk++;
          if (hasErrorMsg) {
            console.log(`   external link:  ✓ ${res.status} but page shows error msg`);
          } else {
            console.log(`   external link:  ✓ ${res.status} page loads${hasVideoMarkup ? ", has player" : ""}`);
          }
        } else {
          console.log(`   external link:  ✗ ${res.status}`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log(`   external link:  ✗ ${msg.slice(0, 45)}`);
      }
    }

    // Test video-proxy (requires dev server)
    if (direct) {
      try {
        const res = await fetch(`${PROXY_BASE}/api/video-proxy?id=${encodeURIComponent(id)}`, {
          method: "HEAD",
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const ct = res.headers.get("content-type") || "";
          const ok = ct.includes("video/") || res.headers.get("content-length");
          if (ok) {
            proxyOk++;
            console.log(`   video-proxy:    ✓ ${res.status} ${ct.slice(0, 30)}`);
          } else {
            console.log(`   video-proxy:    ? ${res.status} (content-type: ${ct})`);
          }
        } else {
          console.log(`   video-proxy:    ✗ ${res.status}`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("fetch") || msg.includes("ECONNREFUSED")) {
          console.log(`   video-proxy:    ✗ Server not running? (npm run dev)`);
        } else {
          console.log(`   video-proxy:    ✗ ${msg.slice(0, 50)}`);
        }
      }

      // Test direct URL (source) - HEAD request
      try {
        const res = await fetch(direct, {
          method: "HEAD",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
            Referer: new URL(direct).origin + "/",
          },
          signal: AbortSignal.timeout(6000),
          redirect: "follow",
        });
        if (res.ok) {
          directUrlOk++;
          console.log(`   direct URL:     ✓ ${res.status}`);
        } else {
          console.log(`   direct URL:     ✗ ${res.status}`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log(`   direct URL:     ✗ ${msg.slice(0, 40)}`);
      }
    }

    console.log("");
  }

  console.log("──────────────────────────────────────────────────────────");
  console.log("SUMMARY");
  console.log("──────────────────────────────────────────────────────────");
  console.log(`Videos with directVideoUrl: ${withDirect}/${snap.size}`);
  console.log(`Videos with embedUrl:       ${withEmbed}/${snap.size}`);
  console.log(`Videos with outboundUrl:    ${withOutbound}/${snap.size}`);
  if (withDirect > 0) {
    console.log(`video-proxy responding:     ${proxyOk}/${withDirect} (run 'npm run dev' to test)`);
    console.log(`Direct source reachable:    ${directUrlOk}/${withDirect}`);
  }
  console.log(`External link (outbound):    ${outboundOk}/${withOutbound} pages load`);
  console.log("──────────────────────────────────────────────────────────\n");

  if (outboundOk === withOutbound && withOutbound > 0) {
    console.log("✓ External links work → 'ভিডিও দেখতে এখানে ক্লিক করুন' opens source page");
  } else if (outboundOk < withOutbound) {
    console.log("⚠ Some external links may not load (403/blocked). Try in browser.");
  }
  if (withOutbound === snap.size) {
    console.log("✓ All videos have outboundUrl");
  }
  if (withDirect > 0 && directUrlOk < withDirect) {
    console.log("⚠ Some direct URLs unreachable → source may block or links expired");
  }
  if (withDirect === 0 && withEmbed === 0) {
    console.log("⚠ No direct/embed URLs → only external link available. Re-crawl with Puppeteer.");
  }
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
