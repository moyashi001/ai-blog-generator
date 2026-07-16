export interface GeneratePromptRequest {
  // 商品名・型番のどちらか一方が入力されていればよい
  productName?: string;
  // 型番が入力されていれば、楽天/Yahoo!の検索キーワードとして商品名より優先する
  modelNumber?: string;
  // Amazonは自動検索非対応のため常に手動入力。楽天/Yahoo!は自動検索するが、
  // 結果が誤っている場合に備えて手動URLでの上書きも受け付ける
  amazonUrl?: string;
  // Amazon商品画像URL（任意・カード風表示に使う。楽天/Yahoo!は検索結果の画像を自動取得するため不要）
  amazonImageUrl?: string;
  rakutenUrl?: string;
  yahooUrl?: string;
  // 記事に組み込みたい画像（任意）
  imageUrl?: string;
  imageDescription?: string;
}

export interface AffiliateLinkInfo {
  url: string;
  imageUrl?: string;
}

export interface AffiliateLinks {
  amazon?: AffiliateLinkInfo;
  rakuten?: AffiliateLinkInfo;
  yahoo?: AffiliateLinkInfo;
}

export interface GeneratePromptResponse {
  prompt: string;
  affiliateLinks: AffiliateLinks;
}
