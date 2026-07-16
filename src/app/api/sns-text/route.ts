import { NextRequest, NextResponse } from "next/server";
import { generateSnsTextsContent } from "@/lib/claude";
import { SnsTextRequest } from "@/types";

export async function POST(req: NextRequest) {
  let body: SnsTextRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { title, article } = body;
  if (!title || !article) {
    return NextResponse.json({ error: "title and article are required" }, { status: 400 });
  }

  try {
    const snsTexts = await generateSnsTextsContent(title, article);
    return NextResponse.json(snsTexts);
  } catch (err) {
    console.error("sns-text failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
