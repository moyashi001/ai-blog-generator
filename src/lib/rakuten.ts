import "server-only";

// 楽天市場商品検索API（Ichiba Item Search API）
// 事前登録不要・審査不要で利用できる。アプリID(RAKUTEN_APP_ID)のみで動作し、
// アフィリエイトID(RAKUTEN_AFFILIATE_ID)を設定するとレスポンスにアフィリエイトURLが含まれる。
// 参考: https://webservice.rakuten.co.jp/api/ichibaitemsearch/

const ENDPOINT = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601";

interface RakutenItem {
  itemName: string;
  itemUrl: string;
  affiliateUrl?: string;
  itemPrice: number;
  shopName: string;
  mediumImageUrls: { imageUrl: string }[];
}

interface RakutenSearchResponse {
  Items: { Item: RakutenItem }[];
}

export interface RakutenProductResult {
  name: string;
  url: string;
  price: number;
  shopName: string;
  imageUrl?: string;
}

export async function searchRakutenItem(
  keyword: string
): Promise<RakutenProductResult | null> {
  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) {
    throw new Error("RAKUTEN_APP_ID is not set on the server");
  }
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  const params = new URLSearchParams({
    applicationId: appId,
    keyword,
    hits: "1",
    sort: "standard",
    format: "json",
  });
  if (affiliateId) {
    params.set("affiliateId", affiliateId);
  }

  const res = await fetch(`${ENDPOINT}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Rakuten API error: ${res.status}`);
  }
  const data = (await res.json()) as RakutenSearchResponse;
  const item = data.Items?.[0]?.Item;
  if (!item) return null;

  return {
    name: item.itemName,
    url: item.affiliateUrl || item.itemUrl,
    price: item.itemPrice,
    shopName: item.shopName,
    imageUrl: item.mediumImageUrls?.[0]?.imageUrl,
  };
}
