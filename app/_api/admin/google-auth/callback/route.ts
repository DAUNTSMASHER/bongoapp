import { NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/googleAuth";
import { getDb } from "@/lib/firebaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/admin/dashboard?error=no_code", request.url));
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      // Store in Firestore
      const db = getDb();
      await db.collection("config").doc("marketing").set({
        googleRefreshToken: tokens.refresh_token,
        googleConnectedAt: new Date().toISOString(),
      }, { merge: true });
    }

    // Redirect back to dashboard with success
    return NextResponse.redirect(new URL("/admin/dashboard?tab=marketing&google=connected", request.url));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/admin/dashboard?tab=marketing&error=oauth_failed", request.url));
  }
}
