import { NextRequest, NextResponse } from "next/server";
import { analyzeImageContent } from "@/lib/claude";
import { AnalyzeImageRequest, AnalyzeImageResponse } from "@/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  let body: AnalyzeImageRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { imageBase64, mediaType } = body;
  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "imageBase64 and mediaType are required" }, { status: 400 });
  }
  if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mediaType)) {
    return NextResponse.json({ error: "unsupported mediaType" }, { status: 400 });
  }
  // base64文字列のおおよそのバイト数をチェック
  if (imageBase64.length * 0.75 > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "image too large (max 5MB)" }, { status: 400 });
  }

  try {
    const description = await analyzeImageContent(imageBase64, mediaType);
    const response: AnalyzeImageResponse = { description };
    return NextResponse.json(response);
  } catch (err) {
    console.error("analyze-image failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
