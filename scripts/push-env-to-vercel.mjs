#!/usr/bin/env node
/**
 * Push NEXT_PUBLIC_FIREBASE_* and FIREBASE_SERVICE_ACCOUNT to Vercel.
 * Reads from .env.local, or uses lib/firebase.ts fallbacks for Firebase config.
 * FIREBASE_SERVICE_ACCOUNT must be in .env.local (from Firebase Console) for Admin crawl.
 * Run: node scripts/push-env-to-vercel.mjs
 */
import { readFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

const DEFAULTS = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyANloyaLFL60CNIz2Tg1HoyH72qoTN318s",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "bongochoti.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "bongochoti",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "bongochoti.firebasestorage.app",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1018880595884",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1018880595884:web:62fcaa85e9b87d87530c09",
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-T51ZDP5989",
};

const vars = { ...DEFAULTS };

if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1).replace(/\\(.)/g, "$1");
    }
    if (key.startsWith("NEXT_PUBLIC_FIREBASE_") || key === "FIREBASE_SERVICE_ACCOUNT" || key === "ADSTERRA_API_KEY") {
      if (val) vars[key] = val;
    }
  }
}

const toAdd = Object.entries(vars).filter(([, v]) => v);
if (toAdd.length === 0) {
  console.error("No variables to add.");
  process.exit(1);
}
console.log(`Pushing ${toAdd.length} variable(s) to Vercel...`);
const targets = ["production"]; // Add "preview","development" if needed
for (const [key, value] of toAdd) {
  for (const env of targets) {
    let valueToSend = value;
    if (key === "FIREBASE_SERVICE_ACCOUNT") {
      console.log(`Encoding ${key} as Base64 for safety...`);
      valueToSend = Buffer.from(value).toString("base64");
    }

    console.log(`Adding ${key} to ${env}...`);
    const args = ["vercel", "env", "add", key, env, "--value", `"${valueToSend}"`, "--force", "--yes"];
    const result = spawnSync("npx", args, {
      stdio: "inherit",
      shell: true,
    });
    if (result.status !== 0) {
      console.error(`Failed to add ${key} to ${env}`);
      process.exit(1);
    }
  }
}
console.log("Done.");
if (!vars.FIREBASE_SERVICE_ACCOUNT) {
  console.log("Note: Add FIREBASE_SERVICE_ACCOUNT to .env.local (Firebase Console → Service Accounts) for Admin video crawl.");
}
console.log("Redeploy: npx vercel --prod");
