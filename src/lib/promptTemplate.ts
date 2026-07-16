import "server-only";
import { AffiliateLinkInfo, AffiliateLinks } from "@/types";

const STYLE_GUIDE = `【文体の参考（ブログ「もや暮らし」https://moyagurashi.com/ のスタイルを踏襲）】
- 一人称は「私」、ブログの署名は「もや暮らし」。「こんにちは、〜のもや暮らしです！」のような挨拶で書き出す。
- 基本は です/ます調 だが、「まじで」「めんどくさい」のような口語的な言い回しも交えたカジュアルな敬体にする。
- 冒頭で日常のちょっとした悩み・きっかけを語ってから商品紹介に入る（例：「みなさん、〜しませんか？」と読者に問いかける）。
- 良かった点は3つ程度に整理し、気になった点（価格・機能面など）も正直に書く。「どんな人におすすめか／おすすめしないか」を明確に分ける。
- 段落は短めにして改行を多く入れる。箇条書きや✅/❌/⚠️のような記号を要所で使い、視覚的に読みやすくする。`;

const CARD_EXAMPLE = `<div style="border:1px solid #e0e0e0;border-radius:12px;padding:16px;display:flex;align-items:center;gap:16px;margin:24px 0;">
  <img src="商品画像URL" alt="商品名" style="width:96px;height:96px;object-fit:contain;border-radius:8px;flex-shrink:0;">
  <div style="flex:1;">
    <p style="margin:0 0 8px;font-weight:bold;font-size:15px;">商品名</p>
    <a href="アフィリエイトURL" target="_blank" rel="nofollow noopener" style="display:inline-block;background:#ff6b35;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">ストア名で見る</a>
  </div>
</div>`;

const TEMPLATE = `以下の商品について、WordPress（テーマ：SWELL）にそのまま貼り付けて公開できるブログ記事を作成してください。

商品名：{{PRODUCT_NAME}}{{MODEL_NUMBER_LINE}}
{{AMAZON_LINE}}
{{RAKUTEN_LINE}}
{{YAHOO_LINE}}
{{IMAGE_LINE}}
${STYLE_GUIDE}

【アフィリエイトリンクの表示形式】
上記の各リンクは単なるテキストリンクではなく、商品画像とボタンを含むカード形式のHTMLで表示してください。インラインCSSを使い、以下のような形にしてください（色やストア名は各ストアに合わせて調整可）。
${CARD_EXAMPLE}
商品画像が指定されていないリンクは、上記のカードから<img>タグを省いた形（ボタンのみのカード）にしてください。リンクが「（未設定）」のストアはカード自体を出力しないでください。

【出力形式】
- WordPressのブロックエディタ（Gutenberg）に直接貼り付けてもレイアウトが崩れないよう、HTML形式で出力してください（Markdownの「#」「*」などの記号は使わないでください）。
- 見出しは<h2>・<h3>タグ、本文は<p>タグ、箇条書きは<ul><li>タグ、強調したい箇所は<strong>タグを使用してください。SWELL独自のショートコードは使わず、標準的なHTMLタグのみで構成してください。
- 前置きや説明文、コードブロック記法（\`\`\`）は付けず、記事本文のHTMLのみを出力してください。
- 商品紹介部分とまとめの2箇所に、上記のアフィリエイトリンクカードを自然に配置してください。{{IMAGE_INSTRUCTION}}

【記事構成】
1. 商品の概要
2. 特徴（箇条書き）
3. 実際の使用シーン
4. メリット・デメリット
5. 他製品との比較
6. まとめ（購入を迷っている人への後押し。ここにもリンクカードを設置）

SEOを意識して、自然な文章で書いてください。`;

function formatLinkLine(storeName: string, info?: AffiliateLinkInfo): string {
  if (!info) return `${storeName}リンク：（未設定）`;
  const imagePart = info.imageUrl ? `\n${storeName}商品画像：${info.imageUrl}` : `\n${storeName}商品画像：（なし）`;
  return `${storeName}リンク：${info.url}${imagePart}`;
}

export function buildArticlePrompt(params: {
  displayName: string;
  modelNumber?: string;
  links: AffiliateLinks;
  imageUrl?: string;
  imageDescription?: string;
}): string {
  const { displayName, modelNumber, links, imageUrl, imageDescription } = params;

  const modelNumberLine = modelNumber ? `\n型番：${modelNumber}` : "";
  const imageLine = imageUrl
    ? `\n記事に組み込む画像URL：${imageUrl}\n画像の内容：${imageDescription || "（説明なし）"}`
    : "";
  const imageInstruction = imageUrl
    ? ` また、上記の画像URLを<img src="${imageUrl}" alt="${imageDescription || displayName}" loading="lazy">の形で、画像の内容の説明に合う本文の位置に1箇所挿入してください。`
    : "";

  return TEMPLATE.replace("{{PRODUCT_NAME}}", displayName)
    .replace("{{MODEL_NUMBER_LINE}}", modelNumberLine)
    .replace("{{AMAZON_LINE}}", formatLinkLine("Amazon", links.amazon))
    .replace("{{RAKUTEN_LINE}}", formatLinkLine("楽天", links.rakuten))
    .replace("{{YAHOO_LINE}}", formatLinkLine("Yahoo", links.yahoo))
    .replace("{{IMAGE_LINE}}", imageLine)
    .replace("{{IMAGE_INSTRUCTION}}", imageInstruction);
}
