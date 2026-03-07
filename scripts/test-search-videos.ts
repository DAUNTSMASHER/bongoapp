/**
 * Test search-videos flow from terminal.
 * Run: npx tsx scripts/test-search-videos.ts "bangla video"
 * Requires .env.local with SERPER_API_KEY
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

import { searchAndExtractVideos } from "../lib/searchVideos";

async function main() {
  const query = process.argv[2] || "bangla video";
  const max = Number(process.argv[3]) || 5;

  console.log(`Query: "${query}", max: ${max}`);
  console.log("SERPER_API_KEY:", process.env.SERPER_API_KEY ? "set" : "MISSING");
  console.log("");

  try {
    const videos = await searchAndExtractVideos(query, max);
    console.log(`Found ${videos.length} video(s):`);
    videos.forEach((v, i) => {
      console.log(`\n${i + 1}. ${v.title}`);
      console.log(`   URL: ${v.outboundUrl}`);
      if (v.directVideoUrl) console.log(`   direct: ${v.directVideoUrl}`);
      if (v.embedUrl) console.log(`   embed: ${v.embedUrl}`);
    });
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

main();
