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

  const { productName, modelNumber, amazonUrl, rakutenUrl: rakutenUrlInput, yahooUrl: yahooUrlInput } = body;

  if (!productName || typeof productName !== "string" || !productName.trim()) {
    return NextResponse.json({ error: "productName is required" }, { status: 400 });
  }
  const trimmedName = productName.trim();
  const trimmedModelNumber = modelNumber?.trim() || undefined;
  // 型番が入力されていれば検索キーワードとして商品名より優先する
  const searchKeyword = trimmedModelNumber || trimmedName;

  const [searchedRakutenUrl, searchedYahooUrl] = await Promise.all([
    rakutenUrlInput
      ? Promise.resolve(null)
      : searchRakutenItemUrl(searchKeyword).catch((err) => {
          console.error("Rakuten search failed:", err);
          return null;
        }),
    yahooUrlInput
      ? Promise.resolve(null)
      : searchYahooItemUrl(searchKeyword).catch((err) => {
          console.error("Yahoo search failed:", err);
          return null;
        }),
  ]);

  const rakutenUrl = rakutenUrlInput || searchedRakutenUrl;
  const yahooUrl = yahooUrlInput || searchedYahooUrl;

  const affiliateLinks: AffiliateLinks = {
    amazon: amazonUrl ? buildMoshimoLink("amazon", amazonUrl) ?? amazonUrl : undefined,
    rakuten: rakutenUrl ? buildMoshimoLink("rakuten", rakutenUrl) ?? rakutenUrl : undefined,
    yahoo: yahooUrl ? buildMoshimoLink("yahoo", yahooUrl) ?? yahooUrl : undefined,
  };

  const prompt = buildArticlePrompt(trimmedName, trimmedModelNumber, affiliateLinks);

  const response: GeneratePromptResponse = { prompt, affiliateLinks };
  return NextResponse.json(response);
}
