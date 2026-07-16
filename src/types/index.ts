export interface GeneratePromptRequest {
  productName: string;
  amazonUrl?: string;
  rakutenUrl?: string;
  yahooUrl?: string;
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
