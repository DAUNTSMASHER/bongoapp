import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables for standalone scripts (Next.js handles this automatically in the app)
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

/**
 * Ultra-Robust Firebase Admin initialization. 
 * Strictly ensures the [DEFAULT] app uses the provided Service Account Project ID.
 */
export function getFirebaseAdmin() {
  const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  let sa: any = null;

  // Fallback to local service-account.json if env var is missing
  if (!saVar) {
    try {
      if (typeof fs.existsSync === 'function') {
        const localSaPath = path.resolve(process.cwd(), "service-account.json");
        if (fs.existsSync(localSaPath)) {
          sa = JSON.parse(fs.readFileSync(localSaPath, "utf8"));
        }
      }
    } catch (e: any) {
      console.error("[Firebase] Failed to read/parse local service-account.json:", e.message);
    }
  }

  if (saVar) {
    const rawVal = saVar.trim();
    let cleaned = rawVal;
    
    // 1. Strip wrapping quotes (common shell artifact)
    if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || 
        (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    // --- TRIPLE LAYER PARSING STRATEGY ---
    try {
      sa = JSON.parse(cleaned);
    } catch (e) {
      try {
        const decoded = Buffer.from(cleaned, 'base64').toString('utf8').trim();
        if (decoded.startsWith('{')) {
          sa = JSON.parse(decoded);
          console.log("[Firebase] SUCCESS: Parsed after Base64 decoding.");
        }
      } catch (e2) {
        try {
          let repair = cleaned;
          repair = repair.replace(/\n/g, "\\n");
          if (!repair.includes('"type":') && repair.includes('type:')) {
            repair = repair.replace(/([\{\,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          }
          if (repair.endsWith('\\"}')) {
            repair = repair.slice(0, -3) + '\\n"}';
          }
          sa = JSON.parse(repair);
          console.log("[Firebase] SUCCESS: Parsed after robust regex repair.");
        } catch (e3: any) {
          console.warn("[Firebase] Environment variable parsing failed. Will try file fallback.");
        }
      }
    }

    if (sa && sa.private_key) {
      sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }
  }

  // Final Fallback: If sa is still null after env check, try local file
  if (!sa || !sa.project_id) {
    try {
      if (typeof fs.existsSync === 'function') {
        const localSaPath = path.resolve(process.cwd(), "service-account.json");
        if (fs.existsSync(localSaPath)) {
          const fileContent = fs.readFileSync(localSaPath, "utf8");
          sa = JSON.parse(fileContent);
          console.log(`[Firebase] Loaded credentials from local file: ${localSaPath}`);
        }
      }
    } catch (e: any) {
      console.error("[Firebase] Failed to parse local service-account.json:", e.message);
    }
  }

  // If we have a service account, we MUST ensure the app matches it.
  if (admin.apps.length > 0) {
    const currentApp = admin.app();
    const expectedProjectId = sa?.project_id;
    
    // Safety check: If app is generic or has different projectId, delete it.
    if (expectedProjectId && currentApp.options.projectId !== expectedProjectId) {
      console.warn(`[Firebase] Detected app mismatch (${currentApp.options.projectId} vs ${expectedProjectId}). Re-initializing...`);
      try {
        currentApp.delete();
      } catch (e) {
        console.error("[Firebase] App deletion failed:", e);
      }
    }
  }

  if (admin.apps.length === 0) {
    try {
      if (sa && sa.project_id && sa.private_key) {
        admin.initializeApp({
          credential: admin.credential.cert(sa),
          projectId: sa.project_id,
        });
        console.log(`[Firebase] SUCCESS: Initialized with Service Account: ${sa.project_id}`);
      } else {
        // Fallback for standard GCP environments (Vercel automatic or local)
        admin.initializeApp();
        console.log("[Firebase] Initialized with Default/Env Credentials");
      }
    } catch (e) {
      console.error("[Firebase] CRITICAL Initialization Failure:", e);
      // Failsafe: if still not initialized, try one last empty init
      if (admin.apps.length === 0) admin.initializeApp();
    }
  }

  return admin;
}

/**
 * Reliable Firestore DB getter.
 */
export const getDb = () => getFirebaseAdmin().firestore();

// Exports for backward compatibility
export const db = admin.apps.length > 0 ? admin.firestore() : null;
export { admin };
