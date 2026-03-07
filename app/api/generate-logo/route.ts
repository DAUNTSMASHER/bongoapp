import { NextResponse } from "next/server";

/**
 * Generates an AI logo using Hugging Face Inference API (free tier).
 * Set HUGGINGFACE_API_KEY in .env.local to use.
 * Visit POST /api/generate-logo to get a PNG logo.
 */
export async function POST() {
  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "Set HUGGINGFACE_API_KEY in .env.local. Get a free token at https://huggingface.co/settings/tokens" },
      { status: 401 }
    );
  }

  const prompt =
    "minimalist logo of an open book, flat design, simple, clean, single primary color, white background, professional app icon, 512x512";

  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Hugging Face API error: ${err}` },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 }
    );
  }
}
