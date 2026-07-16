import "server-only";

// 楽天市場商品検索API（Ichiba Item Search API）
// 2026年に仕様変更があり、新エンドポイント(openapi.rakuten.co.jp)では
// applicationId に加えて accessKey が必須になり、Origin/Referer ヘッダーも必要になった。
// このヘッダーの値は楽天アプリ管理画面に登録した「アプリケーションURL」と一致している必要がある
// （不一致だと 403 HTTP_REFERRER_NOT_ALLOWED になる）。
// 参考: https://webservice.rakuten.co.jp/documentation/ichiba-item-search

const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";

interface RakutenItem {
  itemName: string;
  itemUrl: string;
  affiliateUrl?: string;
  mediumImageUrls?: { imageUrl: string }[];
}

interface RakutenSearchResponse {
  Items: { Item: RakutenItem }[];
}

export interface RakutenSearchResult {
  url: string;
  imageUrl?: string;
}

export async function searchRakutenItem(keyword: string): Promise<RakutenSearchResult | null> {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const origin = process.env.RAKUTEN_APP_ORIGIN;
  if (!appId || !accessKey || !origin) return null;

  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    keyword,
    hits: "1",
    sort: "standard",
    format: "json",
  });
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (affiliateId) {
    params.set("affiliateId", affiliateId);
  }

  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: {
      Origin: origin,
      Referer: origin,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Rakuten API error: ${res.status} ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as RakutenSearchResponse;
  const item = data.Items?.[0]?.Item;
  if (!item) return null;

  return {
    url: item.affiliateUrl || item.itemUrl,
    imageUrl: item.mediumImageUrls?.[0]?.imageUrl,
  };
}
