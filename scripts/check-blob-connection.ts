/**
 * Check if Vercel Blob store "bongochoti" is connected.
 * Run: npx tsx scripts/check-blob-connection.ts
 */

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });
import { list } from "@vercel/blob";

const POSSIBLE_TOKEN_NAMES = [
  "BLOB_READ_WRITE_TOKEN",
  "VERCEL_BLOB_READ_WRITE_TOKEN",
  "BONGOCHOTI_BLOB_READ_WRITE_TOKEN",
];

function findToken(): { name: string; value: string } | null {
  for (const name of POSSIBLE_TOKEN_NAMES) {
    const value = process.env[name]?.trim();
    if (value) return { name, value };
  }
  return null;
}

async function main() {
  console.log("Checking Vercel Blob connection...\n");

  const token = findToken();
  if (!token) {
    console.log("❌ No Blob token found. Checked:");
    POSSIBLE_TOKEN_NAMES.forEach((n) => console.log(`   - ${n}`));
    console.log("\nTo fix:");
    console.log("  1. Vercel Dashboard → Your Project → Storage → Create Blob store (or use existing 'bongochoti')");
    console.log("  2. Run: vercel env pull");
    console.log("  3. Or add BLOB_READ_WRITE_TOKEN manually to .env.local");
    process.exit(1);
  }

  console.log(`✓ Token found: ${token.name} (${token.value.slice(0, 20)}...)`);

  try {
    const result = await list({ token: token.value, limit: 1 });
    console.log(`✓ Blob store connected successfully`);
    console.log(`  Store has blobs: ${result.blobs.length > 0 ? "yes" : "empty (no files yet)"}`);
    if (result.blobs.length > 0) {
      console.log(`  Sample: ${result.blobs[0].pathname}`);
    }
  } catch (err) {
    console.log("\n❌ Connection failed:");
    console.log(err instanceof Error ? err.message : String(err));
    console.log("\nPossible causes:");
    console.log("  - Token is invalid or expired");
    console.log("  - Blob store 'bongochoti' not linked to this project");
    console.log("  - Wrong token copied from store settings");
    process.exit(1);
  }

  console.log("\n✓ Blob is ready. You can run: npm run migrate-videos");
}

main();
