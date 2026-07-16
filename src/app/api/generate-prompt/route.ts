import { NextRequest, NextResponse } from "next/server";
import { buildMoshimoLink } from "@/lib/moshimo";
import { buildArticlePrompt } from "@/lib/promptTemplate";
import { AffiliateLinks, GeneratePromptRequest, GeneratePromptResponse } from "@/types";

export async function POST(req: NextRequest) {
  let body: GeneratePromptRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { productName, amazonUrl, rakutenUrl, yahooUrl } = body;

  if (!productName || typeof productName !== "string" || !productName.trim()) {
    return NextResponse.json({ error: "productName is required" }, { status: 400 });
  }

  const affiliateLinks: AffiliateLinks = {
    amazon: amazonUrl ? buildMoshimoLink("amazon", amazonUrl) ?? amazonUrl : undefined,
    rakuten: rakutenUrl ? buildMoshimoLink("rakuten", rakutenUrl) ?? rakutenUrl : undefined,
    yahoo: yahooUrl ? buildMoshimoLink("yahoo", yahooUrl) ?? yahooUrl : undefined,
  };

  const prompt = buildArticlePrompt(productName.trim(), affiliateLinks);

  const response: GeneratePromptResponse = { prompt, affiliateLinks };
  return NextResponse.json(response);
}
