/**
 * Admin API: Upload story cover image.
 * POST multipart/form-data with field "file" (image).
 * Auto-renames to story_cover/cover_YYYYMMDD_<random>.<ext> and stores in Vercel Blob.
 * Returns { url: string }.
 */

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getExt(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(req: Request) {
  try {
    const token =
      process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BONGOCHOTI_BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) {
      return NextResponse.json(
        { error: "Blob storage not configured. Add BLOB_READ_WRITE_TOKEN in Vercel." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file. Send multipart form with field 'file'." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid type. Use JPG, PNG, WebP or GIF." },
        { status: 400 }
      );
    }

    const ext = getExt(file.type);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const name = `cover_${date}_${randomId()}.${ext}`;
    const pathname = `story_cover/${name}`;

    const blob = await put(pathname, file, {
      contentType: file.type,
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
