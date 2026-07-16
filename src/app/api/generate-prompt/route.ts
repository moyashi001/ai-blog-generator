import { NextRequest, NextResponse } from "next/server";
import { buildMoshimoLink } from "@/lib/moshimo";
import { buildArticlePrompt } from "@/lib/promptTemplate";
import { searchRakutenItemUrl } from "@/lib/rakuten";
import { searchYahooItemUrl } from "@/lib/yahoo";
import { AffiliateLinks, GeneratePromptRequest, GeneratePromptResponse } from "@/types";

export async function POST(req: NextRequest) {
  let body: GeneratePromptRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { productName, amazonUrl } = body;

  if (!productName || typeof productName !== "string" || !productName.trim()) {
    return NextResponse.json({ error: "productName is required" }, { status: 400 });
  }
  const trimmedName = productName.trim();

  const [rakutenUrl, yahooUrl] = await Promise.all([
    searchRakutenItemUrl(trimmedName).catch((err) => {
      console.error("Rakuten search failed:", err);
      return null;
    }),
    searchYahooItemUrl(trimmedName).catch((err) => {
      console.error("Yahoo search failed:", err);
      return null;
    }),
  ]);

  const affiliateLinks: AffiliateLinks = {
    amazon: amazonUrl ? buildMoshimoLink("amazon", amazonUrl) ?? amazonUrl : undefined,
    rakuten: rakutenUrl ? buildMoshimoLink("rakuten", rakutenUrl) ?? rakutenUrl : undefined,
    yahoo: yahooUrl ? buildMoshimoLink("yahoo", yahooUrl) ?? yahooUrl : undefined,
  };

  const prompt = buildArticlePrompt(trimmedName, affiliateLinks);

  const response: GeneratePromptResponse = { prompt, affiliateLinks };
  return NextResponse.json(response);
}
