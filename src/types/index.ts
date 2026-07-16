export type ArticleTemplate = "review" | "comparison" | "ranking" | "experience";

export const TEMPLATE_LABELS: Record<ArticleTemplate, string> = {
  review: "レビュー",
  comparison: "比較",
  ranking: "ランキング",
  experience: "体験談",
};

export interface GenerateArticleRequest {
  productName: string;
  template: ArticleTemplate;
  imageDescription?: string;
  amazonUrl?: string;
  rakutenUrl?: string;
}

export interface AffiliateLinks {
  amazon?: string;
  rakuten?: string;
  yahoo?: string;
}

export interface SnsTexts {
  twitter: string;
  instagram: string;
  tiktok: string;
}

export interface GenerateArticleResponse {
  title: string;
  title_candidates: string[];
  seo_keywords: string[];
  affiliate_links: AffiliateLinks;
  article: string;
  sns_texts: SnsTexts;
}

export interface RewriteRequest {
  article: string;
  instruction?: string;
}

export interface RewriteResponse {
  article: string;
}

export interface AnalyzeImageRequest {
  imageBase64: string;
  mediaType: string;
}

export interface AnalyzeImageResponse {
  description: string;
}

export interface AffiliateLinksRequest {
  productName: string;
  amazonUrl?: string;
  rakutenItemUrl?: string;
}

export interface SnsTextRequest {
  title: string;
  article: string;
}
