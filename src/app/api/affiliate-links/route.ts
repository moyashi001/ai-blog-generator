import { NextRequest, NextResponse } from "next/server";
import { searchAmazonItem } from "@/lib/amazon";
import { searchRakutenItem } from "@/lib/rakuten";
import { buildMoshimoLink } from "@/lib/moshimo";
import { AffiliateLinks, AffiliateLinksRequest } from "@/types";

export async function POST(req: NextRequest) {
  let body: AffiliateLinksRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { productName } = body;
  if (!productName || typeof productName !== "string" || !productName.trim()) {
    return NextResponse.json({ error: "productName is required" }, { status: 400 });
  }

  const [amazonResult, rakutenResult] = await Promise.all([
    searchAmazonItem(productName).catch((err) => {
      console.error("Amazon search failed:", err);
      return null;
    }),
    searchRakutenItem(productName).catch((err) => {
      console.error("Rakuten search failed:", err);
      return null;
    }),
  ]);

  const yahooSearchUrl = `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(productName)}`;

  const links: AffiliateLinks = {
    amazon: amazonResult?.url,
    rakuten: rakutenResult ? buildMoshimoLink("rakuten", rakutenResult.url) ?? rakutenResult.url : undefined,
    yahoo: buildMoshimoLink("yahoo", yahooSearchUrl) ?? yahooSearchUrl,
  };

  return NextResponse.json(links);
}
