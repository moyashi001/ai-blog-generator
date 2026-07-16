import { ArticleTemplate, TEMPLATE_LABELS } from "@/types";

const TEMPLATE_GUIDE: Record<ArticleTemplate, string> = {
  review:
    "商品を実際に使った視点でのレビュー記事。特徴・メリット/デメリット・どんな人におすすめかを中心に構成する。",
  comparison:
    "同カテゴリの競合商品2〜3点と比較する記事。比較表を意識した見出しを作り、それぞれの強み・弱みを整理したうえで結論を示す。",
  ranking:
    "商品を含む複数アイテムのランキング記事。1位〜5位程度の順位形式で紹介し、選定基準を明記する。",
  experience:
    "一人称の体験談記事。購入のきっかけ、使ってみた感想、率直な良かった点・気になった点を時系列や場面を交えて書く。",
};

export function buildArticlePrompt(params: {
  productName: string;
  template: ArticleTemplate;
  imageDescription?: string;
}): string {
  const { productName, template, imageDescription } = params;

  return `あなたはSEOに強い日本語のブログ編集者です。以下の商品について「${TEMPLATE_LABELS[template]}」形式のブログ記事を作成してください。

# 商品名
${productName}

# 記事タイプの方針
${TEMPLATE_GUIDE[template]}

${imageDescription ? `# 商品画像の解析結果（参考情報として本文に自然に反映すること）\n${imageDescription}\n` : ""}
# 記事に必ず含める要素
- 商品の特徴
- メリット・デメリット
- どんな人に向いているか
- ${template === "comparison" ? "競合商品との比較" : "（該当なしなら省略可）"}
- 見出し（##）と段落で構成された読みやすい記事本文（1200〜2000字程度）
- 本文中に「[ここにアフィリエイトリンクを挿入]」という挿入位置マーカーを、記事の導入直後と まとめ直前の2箇所に入れる

# 出力形式
以下のJSON形式のみを出力してください。前後に説明文やコードブロック記法(\`\`\`)は付けないこと。

{
  "title": "記事タイトル（最も良いもの1つ）",
  "title_candidates": ["タイトル案1", "タイトル案2", "タイトル案3"],
  "seo_keywords": ["SEOキーワード1", "SEOキーワード2", "SEOキーワード3", "SEOキーワード4", "SEOキーワード5"],
  "article": "見出し(##)と段落を含む記事本文（Markdown形式）"
}`;
}

export function buildRewritePrompt(article: string, instruction?: string): string {
  return `以下のブログ記事本文を校正・リライトしてください。
誤字脱字や不自然な日本語を修正し、読みやすさを向上させてください。
見出し構成や事実関係は大きく変えないこと。

${instruction ? `# 追加の指示\n${instruction}\n` : ""}
# 元の記事本文
${article}

# 出力形式
リライト後の記事本文（Markdown形式）のみを出力してください。説明文やコードブロック記法は付けないこと。`;
}

export function buildSnsPrompt(title: string, article: string): string {
  return `以下のブログ記事の内容をもとに、SNS投稿文を3種類作成してください。

# 記事タイトル
${title}

# 記事本文
${article}

# 出力形式
以下のJSON形式のみを出力してください。前後に説明文やコードブロック記法は付けないこと。

{
  "twitter": "Twitter(X)向け投稿文。140字以内。ハッシュタグを2〜3個含める",
  "instagram": "Instagram向け投稿文。絵文字を交え、改行を使って読みやすく。ハッシュタグを5個程度末尾に含める",
  "tiktok": "TikTok動画のキャプション向け短文。フックになる一文から始め、ハッシュタグを3個程度含める"
}`;
}

export const IMAGE_ANALYSIS_PROMPT =
  "この商品画像を分析し、色・形状・素材感・パッケージ・見た目から読み取れる特徴を、ブログ記事の執筆に使える客観的な説明文として日本語で3〜5文にまとめてください。説明文のみを出力してください。";
