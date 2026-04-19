import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  const info: any = {
    auth_env_exists: !!saVar,
    sa_length: saVar?.length || 0,
    sa_start: saVar ? saVar.substring(0, 10) + "..." : null,
    sa_end: saVar ? "..." + saVar.substring(saVar.length - 10) : null,
    timestamp: new Date().toISOString(),
  };

  if (saVar) {
    try {
      const sa = JSON.parse(saVar);
      info.sa_parse_success = true;
      info.sa_project_id = sa.project_id;
      info.sa_client_email = sa.client_email;
      info.sa_has_private_key = !!sa.private_key;
    } catch (e: any) {
      info.sa_parse_success = false;
      info.sa_parse_error = e.message;
    }
  }

  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    info.status = "ok";
    
    const testSnap = await db.collection("stories").limit(1).get();
    info.connection = "success";
    info.stories_found = testSnap.size;

  } catch (err: any) {
    info.status = "error";
    info.error = err.message || String(err);
  }

  return NextResponse.json(info);
}
