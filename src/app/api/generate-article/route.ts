import { NextRequest, NextResponse } from "next/server";
import { generateArticleContent, generateSnsTextsContent } from "@/lib/claude";
import { searchAmazonItem } from "@/lib/amazon";
import { searchRakutenItem } from "@/lib/rakuten";
import { buildMoshimoLink } from "@/lib/moshimo";
import {
  ArticleTemplate,
  GenerateArticleRequest,
  GenerateArticleResponse,
} from "@/types";

const VALID_TEMPLATES: ArticleTemplate[] = ["review", "comparison", "ranking", "experience"];

export async function POST(req: NextRequest) {
  let body: GenerateArticleRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { productName, template, imageDescription } = body;

  if (!productName || typeof productName !== "string" || !productName.trim()) {
    return NextResponse.json({ error: "productName is required" }, { status: 400 });
  }
  if (!VALID_TEMPLATES.includes(template)) {
    return NextResponse.json({ error: "invalid template" }, { status: 400 });
  }

  try {
    const [articleResult, amazonResult, rakutenResult] = await Promise.all([
      generateArticleContent({ productName, template, imageDescription }),
      searchAmazonItem(productName).catch((err) => {
        console.error("Amazon search failed:", err);
        return null;
      }),
      searchRakutenItem(productName).catch((err) => {
        console.error("Rakuten search failed:", err);
        return null;
      }),
    ]);

    const rakutenLink = rakutenResult
      ? buildMoshimoLink("rakuten", rakutenResult.url) ?? rakutenResult.url
      : undefined;

    const snsTexts = await generateSnsTextsContent(articleResult.title, articleResult.article);

    const response: GenerateArticleResponse = {
      title: articleResult.title,
      title_candidates: articleResult.title_candidates,
      seo_keywords: articleResult.seo_keywords,
      affiliate_links: {
        amazon: amazonResult?.url,
        rakuten: rakutenLink,
      },
      article: articleResult.article,
      sns_texts: snsTexts,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("generate-article failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
