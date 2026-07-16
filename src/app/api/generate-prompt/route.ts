import { NextRequest, NextResponse } from "next/server";
import { buildMoshimoLink } from "@/lib/moshimo";
import { parseMoshimoEasyLink } from "@/lib/moshimoEasyLink";
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
    moshimoEasyLinkHtml,
    productName,
    modelNumber,
    amazonUrl,
    amazonImageUrl,
    rakutenUrl: rakutenUrlInput,
    yahooUrl: yahooUrlInput,
    imageUrl,
    imageDescription,
  } = body;

  // もしもアフィリエイトの「かんたんリンク」埋め込みコードが貼られていれば、
  // そこから商品名・型番・画像・各ストアのリンクをすべて取得する（検索・個別URL入力より優先）
  const easyLinkHtml = moshimoEasyLinkHtml?.trim();
  const parsedEasyLink = easyLinkHtml ? parseMoshimoEasyLink(easyLinkHtml) : null;

  if (easyLinkHtml && !parsedEasyLink) {
    return NextResponse.json(
      { error: "かんたんリンクの埋め込みコードを解析できませんでした。コードを貼り直してください。" },
      { status: 400 }
    );
  }

  const trimmedName = (parsedEasyLink?.productName || productName)?.trim() || "";
  const trimmedModelNumber = (parsedEasyLink?.modelNumber || modelNumber)?.trim() || "";

  if (!trimmedName && !trimmedModelNumber) {
    return NextResponse.json(
      { error: "productName or modelNumber is required" },
      { status: 400 }
    );
  }

  // 型番が入力されていれば検索キーワード・表示名として商品名より優先する
  const searchKeyword = trimmedModelNumber || trimmedName;
  const displayName = trimmedName || trimmedModelNumber;

  let affiliateLinks: AffiliateLinks;
  let primaryImageUrl: string | undefined;

  if (parsedEasyLink) {
    // かんたんリンクのURLは既にもしもアフィリエイトのクリックURL形式で組み立て済みなので、そのまま使う
    affiliateLinks = {
      amazon: parsedEasyLink.links.amazon ? { url: parsedEasyLink.links.amazon } : undefined,
      rakuten: parsedEasyLink.links.rakuten ? { url: parsedEasyLink.links.rakuten } : undefined,
      yahoo: parsedEasyLink.links.yahoo ? { url: parsedEasyLink.links.yahoo } : undefined,
    };
    primaryImageUrl = parsedEasyLink.imageUrl;
  } else {
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

    affiliateLinks = {
      amazon: buildLinkInfo("amazon", amazonUrl, amazonImageUrl?.trim() || undefined),
      rakuten: buildLinkInfo("rakuten", rakutenUrl, rakutenImageUrl),
      yahoo: buildLinkInfo("yahoo", yahooUrl, yahooImageUrl),
    };

    // 商品紹介カードに使う画像は1枚だけでよいので、Amazon→楽天→Yahoo!の優先順で最初に見つかったものを使う
    primaryImageUrl =
      affiliateLinks.amazon?.imageUrl || affiliateLinks.rakuten?.imageUrl || affiliateLinks.yahoo?.imageUrl;
  }

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
