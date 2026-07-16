import "server-only";

// Yahoo!ショッピング商品検索API（V3 itemSearch）
// Yahoo!デベロッパーネットワークで無料のアプリケーションID(Client ID)を取得すれば利用できる。
// 参考: https://developer.yahoo.co.jp/webapi/shopping/v3/itemsearch.html

const ENDPOINT = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";

interface YahooItem {
  name: string;
  url: string;
  image?: { small?: string; medium?: string };
}

interface YahooSearchResponse {
  hits?: YahooItem[];
}

export interface YahooSearchResult {
  url: string;
  imageUrl?: string;
}

export async function searchYahooItem(keyword: string): Promise<YahooSearchResult | null> {
  const appId = process.env.YAHOO_APP_ID;
  if (!appId) return null;

  const params = new URLSearchParams({
    appid: appId,
    query: keyword,
    results: "1",
  });

  const res = await fetch(`${ENDPOINT}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Yahoo Shopping API error: ${res.status}`);
  }
  const data = (await res.json()) as YahooSearchResponse;
  const item = data.hits?.[0];
  if (!item) return null;

  return {
    url: item.url,
    imageUrl: item.image?.medium || item.image?.small,
  };
}
