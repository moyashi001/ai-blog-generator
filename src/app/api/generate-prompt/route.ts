import { NextRequest, NextResponse } from "next/server";
import { buildMoshimoLink } from "@/lib/moshimo";
import { buildArticlePrompt } from "@/lib/promptTemplate";
import { searchRakutenItem } from "@/lib/rakuten";
import { searchYahooItem } from "@/lib/yahoo";
import { AffiliateLinkInfo, AffiliateLinks, GeneratePromptRequest, GeneratePromptResponse } from "@/types";

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
    amazonImageUrl,
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

  const [searchedRakuten, searchedYahoo] = await Promise.all([
    rakutenUrlInput
      ? Promise.resolve(null)
      : searchRakutenItem(searchKeyword).catch((err) => {
          console.error("Rakuten search failed:", err);
          return null;
        }),
    yahooUrlInput
      ? Promise.resolve(null)
      : searchYahooItem(searchKeyword).catch((err) => {
          console.error("Yahoo search failed:", err);
          return null;
        }),
  ]);

  const rakutenUrl = rakutenUrlInput || searchedRakuten?.url;
  const rakutenImageUrl = rakutenUrlInput ? undefined : searchedRakuten?.imageUrl;
  const yahooUrl = yahooUrlInput || searchedYahoo?.url;
  const yahooImageUrl = yahooUrlInput ? undefined : searchedYahoo?.imageUrl;

  function buildLinkInfo(
    store: "amazon" | "rakuten" | "yahoo",
    url: string | undefined,
    linkImageUrl: string | undefined
  ): AffiliateLinkInfo | undefined {
    if (!url) return undefined;
    return {
      url: buildMoshimoLink(store, url) ?? url,
      imageUrl: linkImageUrl,
    };
  }

  const affiliateLinks: AffiliateLinks = {
    amazon: buildLinkInfo("amazon", amazonUrl, amazonImageUrl?.trim() || undefined),
    rakuten: buildLinkInfo("rakuten", rakutenUrl, rakutenImageUrl),
    yahoo: buildLinkInfo("yahoo", yahooUrl, yahooImageUrl),
  };

  // 商品紹介カードに使う画像は1枚だけでよいので、Amazon→楽天→Yahoo!の優先順で最初に見つかったものを使う
  const primaryImageUrl =
    affiliateLinks.amazon?.imageUrl || affiliateLinks.rakuten?.imageUrl || affiliateLinks.yahoo?.imageUrl;

  // 商品名・型番の両方がある場合のみ型番行を別途表示する（型番のみの場合はdisplayNameに既に含まれる）
  const modelNumberForPrompt = trimmedName && trimmedModelNumber ? trimmedModelNumber : undefined;

  const prompt = buildArticlePrompt({
    displayName,
    modelNumber: modelNumberForPrompt,
    links: affiliateLinks,
    primaryImageUrl,
    imageUrl: imageUrl?.trim() || undefined,
    imageDescription: imageDescription?.trim() || undefined,
  });

  const response: GeneratePromptResponse = { prompt, affiliateLinks };
  return NextResponse.json(response);
}
