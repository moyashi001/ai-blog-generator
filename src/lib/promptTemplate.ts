import "server-only";
import { AffiliateLinks } from "@/types";

const STYLE_GUIDE = `【文体の参考（ブログ「もや暮らし」https://moyagurashi.com/ のスタイルを踏襲）】
- 一人称は「私」、ブログの署名は「もや暮らし」。「こんにちは、〜のもや暮らしです！」のような挨拶で書き出す。
- 基本は です/ます調 だが、「まじで」「めんどくさい」のような口語的な言い回しも交えたカジュアルな敬体にする。
- 冒頭で日常のちょっとした悩み・きっかけを語ってから商品紹介に入る（例：「みなさん、〜しませんか？」と読者に問いかける）。
- 良かった点は3つ程度に整理し、気になった点（価格・機能面など）も正直に書く。「どんな人におすすめか／おすすめしないか」を明確に分ける。
- 段落は短めにして改行を多く入れる。箇条書きや✅/❌/⚠️のような記号を要所で使い、視覚的に読みやすくする。`;

// もや暮らしの記事にある「画像1枚＋商品名＋Amazon/楽天/Yahoo!の3ボタン」形式のカード
const CARD_EXAMPLE = `<div style="border:1px solid #e0e0e0;border-radius:12px;padding:16px;display:flex;gap:16px;margin:24px 0;flex-wrap:wrap;">
  <img src="商品画像URL" alt="商品名" style="width:120px;height:120px;object-fit:contain;border-radius:8px;flex-shrink:0;">
  <div style="flex:1;min-width:200px;">
    <p style="margin:0 0 12px;font-weight:bold;font-size:15px;line-height:1.5;">商品名</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <a href="AmazonのアフィリエイトURL" target="_blank" rel="nofollow noopener" style="flex:1;min-width:100px;text-align:center;background:#ff9900;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">Amazonで見る</a>
      <a href="楽天のアフィリエイトURL" target="_blank" rel="nofollow noopener" style="flex:1;min-width:100px;text-align:center;background:#bf3131;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">楽天市場で見る</a>
      <a href="Yahoo!のアフィリエイトURL" target="_blank" rel="nofollow noopener" style="flex:1;min-width:100px;text-align:center;background:#5e8fd6;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">Yahoo!ショッピングで見る</a>
    </div>
  </div>
</div>`;

const TEMPLATE = `以下の商品について、WordPress（テーマ：SWELL）にそのまま貼り付けて公開できるブログ記事を、SEOと集客を意識して作成してください。

商品名：{{PRODUCT_NAME}}{{MODEL_NUMBER_LINE}}
Amazonリンク：{{AMAZON_LINK}}
楽天リンク：{{RAKUTEN_LINK}}
Yahooリンク：{{YAHOO_LINK}}
商品画像URL：{{PRIMARY_IMAGE_URL}}
{{IMAGE_LINE}}
${STYLE_GUIDE}

【SEO・タイトルの指示】
- 記事タイトル案を3つ提案してください。32文字前後を目安に、商品名・カテゴリ名に加えて「レビュー」「口コミ」「おすすめ」「比較」など検索されやすい語を自然に含めてください。
- 検索結果に表示されるメタディスクリプションを120字程度で1つ作成してください（記事の要点＋読むメリットが伝わる文にする）。
- 記事全体で狙うSEOキーワードを5つ程度（商品名・カテゴリ名・比較語・悩みワードなど検索ボリュームが見込める語）挙げてください。
- 本文の見出し（h2）にはSEOキーワードを自然に含めてください。
- 記事冒頭2〜3文の導入部に主要キーワードを含め、読者の検索意図（購入を迷っている／レビューを知りたい）に応える一文を入れてください。

【アフィリエイトリンクの表示形式】
上記のAmazon/楽天/Yahooリンクは、1つの商品につき1つの「商品紹介カード」としてまとめて表示してください。画像1枚・商品名・3ストア分のボタンを横並びにした、以下のようなインラインCSSのHTMLにしてください。
${CARD_EXAMPLE}
- 商品画像URLが指定されていない場合は<img>タグを省略し、ボタンだけのカードにしてください。
- リンクが「（未設定）」のストアはそのストアのボタンだけを省略し、他のボタンは残してください。

【出力形式】
以下の順番で出力してください。
1. 【タイトル案】（3つ、箇条書き）
2. 【メタディスクリプション】
3. 【SEOキーワード】（カンマ区切り）
4. 【記事本文】以下の条件のHTML
   - WordPressのブロックエディタ（Gutenberg）に直接貼り付けてもレイアウトが崩れないよう、HTML形式で出力する（Markdownの「#」「*」などの記号は使わない）
   - 見出しは<h2>・<h3>タグ、本文は<p>タグ、箇条書きは<ul><li>タグ、強調したい箇所は<strong>タグを使用する。SWELL独自のショートコードは使わず、標準的なHTMLタグのみで構成する
   - コードブロック記法（\`\`\`）は使わない
   - 商品紹介部分とまとめの2箇所に、上記の商品紹介カードを自然に配置する{{IMAGE_INSTRUCTION}}

【記事構成（本文部分）】
1. 商品の概要
2. 特徴（箇条書き）
3. 実際の使用シーン
4. メリット・デメリット
5. 他製品との比較
6. まとめ（購入を迷っている人への後押し。ここにも商品紹介カードを設置）

自然な文章で書いてください。`;

export function buildArticlePrompt(params: {
  displayName: string;
  modelNumber?: string;
  links: AffiliateLinks;
  primaryImageUrl?: string;
  imageUrl?: string;
  imageDescription?: string;
}): string {
  const { displayName, modelNumber, links, primaryImageUrl, imageUrl, imageDescription } = params;

  const modelNumberLine = modelNumber ? `\n型番：${modelNumber}` : "";
  const imageLine = imageUrl
    ? `\n記事に組み込む画像URL：${imageUrl}\n画像の内容：${imageDescription || "（説明なし）"}`
    : "";
  const imageInstruction = imageUrl
    ? ` また、上記の画像URLを<img src="${imageUrl}" alt="${imageDescription || displayName}" loading="lazy">の形で、画像の内容の説明に合う本文の位置に1箇所挿入してください。`
    : "";

  return TEMPLATE.replace("{{PRODUCT_NAME}}", displayName)
    .replace("{{MODEL_NUMBER_LINE}}", modelNumberLine)
    .replace("{{AMAZON_LINK}}", links.amazon?.url ?? "（未設定）")
    .replace("{{RAKUTEN_LINK}}", links.rakuten?.url ?? "（未設定）")
    .replace("{{YAHOO_LINK}}", links.yahoo?.url ?? "（未設定）")
    .replace("{{PRIMARY_IMAGE_URL}}", primaryImageUrl ?? "（なし）")
    .replace("{{IMAGE_LINE}}", imageLine)
    .replace("{{IMAGE_INSTRUCTION}}", imageInstruction);
}
