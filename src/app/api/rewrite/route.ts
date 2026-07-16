import { NextRequest, NextResponse } from "next/server";
import { rewriteArticleContent } from "@/lib/claude";
import { RewriteRequest, RewriteResponse } from "@/types";

export async function POST(req: NextRequest) {
  let body: RewriteRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { article, instruction } = body;
  if (!article || typeof article !== "string" || !article.trim()) {
    return NextResponse.json({ error: "article is required" }, { status: 400 });
  }

  try {
    const rewritten = await rewriteArticleContent(article, instruction);
    const response: RewriteResponse = { article: rewritten };
    return NextResponse.json(response);
  } catch (err) {
    console.error("rewrite failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
