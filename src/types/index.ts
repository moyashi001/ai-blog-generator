export interface GeneratePromptRequest {
  productName: string;
  // 楽天・Yahoo!は商品名から自動検索するため、Amazonのみ手動でURLを受け取る
  // （Amazon PA-APIは個人アソシエイトの審査ハードルが高く自動検索できないため）
  amazonUrl?: string;
}

export interface AffiliateLinks {
  amazon?: string;
  rakuten?: string;
  yahoo?: string;
}

export interface GeneratePromptResponse {
  prompt: string;
  affiliateLinks: AffiliateLinks;
}
