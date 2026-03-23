import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
    if (sa.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(sa),
      });
    } else {
      admin.initializeApp();
    }
  } catch (e) {
    admin.initializeApp();
  }
}

export const db = admin.firestore();
