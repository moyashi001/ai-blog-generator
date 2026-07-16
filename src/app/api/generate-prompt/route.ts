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

  const {
    productName,
    modelNumber,
    amazonUrl,
    rakutenUrl: rakutenUrlInput,
    yahooUrl: yahooUrlInput,
    imageUrl,
    imageDescription,
  } = body;

  const trimmedName = productName?.trim() || "";
  const trimmedModelNumber = modelNumber?.trim() || "";

  if (!trimmedName && !trimmedModelNumber) {
    return NextResponse.json(
      { error: "productName or modelNumber is required" },
      { status: 400 }
    );
  }

  // 型番が入力されていれば検索キーワード・表示名として商品名より優先する
  const searchKeyword = trimmedModelNumber || trimmedName;
  const displayName = trimmedName || trimmedModelNumber;

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

  // 商品名・型番の両方がある場合のみ型番行を別途表示する（型番のみの場合はdisplayNameに既に含まれる）
  const modelNumberForPrompt = trimmedName && trimmedModelNumber ? trimmedModelNumber : undefined;

  const prompt = buildArticlePrompt({
    displayName,
    modelNumber: modelNumberForPrompt,
    links: affiliateLinks,
    imageUrl: imageUrl?.trim() || undefined,
    imageDescription: imageDescription?.trim() || undefined,
  });

  const response: GeneratePromptResponse = { prompt, affiliateLinks };
  return NextResponse.json(response);
}
