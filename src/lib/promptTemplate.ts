import "server-only";
import { AffiliateLinks } from "@/types";

const TEMPLATE = `以下の商品について、WordPress（テーマ：SWELL）にそのまま貼り付けて公開できるブログ記事を作成してください。

商品名：{{PRODUCT_NAME}}
Amazonリンク：{{AMAZON_LINK}}
楽天リンク：{{RAKUTEN_LINK}}
Yahooリンク：{{YAHOO_LINK}}

【出力形式】
- WordPressのブロックエディタ（Gutenberg）に直接貼り付けてもレイアウトが崩れないよう、HTML形式で出力してください（Markdownの「#」「*」などの記号は使わないでください）。
- 見出しは<h2>・<h3>タグ、本文は<p>タグ、箇条書きは<ul><li>タグ、強調したい箇所は<strong>タグを使用してください。SWELL独自のショートコードは使わず、標準的なHTMLタグのみで構成してください。
- 前置きや説明文、コードブロック記法（\`\`\`）は付けず、記事本文のHTMLのみを出力してください。
- 文中（商品紹介部分やまとめ）に、上記のAmazon/楽天/Yahooリンクを<a href="URL" target="_blank" rel="nofollow noopener">テキスト</a>の形で自然に挿入してください。

【記事構成】
1. 商品の概要
2. 特徴（箇条書き）
3. 実際の使用シーン
4. メリット・デメリット
5. 他製品との比較
6. まとめ（購入を迷っている人への後押し。ここにもリンクを設置）

SEOを意識して、自然な文章で書いてください。`;

export function buildArticlePrompt(productName: string, links: AffiliateLinks): string {
  return TEMPLATE.replace("{{PRODUCT_NAME}}", productName)
    .replace("{{AMAZON_LINK}}", links.amazon ?? "（未設定）")
    .replace("{{RAKUTEN_LINK}}", links.rakuten ?? "（未設定）")
    .replace("{{YAHOO_LINK}}", links.yahoo ?? "（未設定）");
}
