export interface GeneratePromptRequest {
  productName: string;
  // 型番が入力されていれば、楽天/Yahoo!の検索キーワードとして商品名より優先する
  modelNumber?: string;
  // Amazonは自動検索非対応のため常に手動入力。楽天/Yahoo!は自動検索するが、
  // 結果が誤っている場合に備えて手動URLでの上書きも受け付ける
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
