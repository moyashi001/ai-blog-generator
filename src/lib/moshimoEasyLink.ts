import "server-only";

// もしもアフィリエイトの「かんたんリンク」埋め込みコード（msmaflink(...)呼び出し）から
// 商品名・画像URL・各ストアのアフィリエイトリンクを抽出する。
// かんたんリンク側で商品情報とプロモーションパラメータ(a_id/p_id/pc_id/pl_id)を
// まとめて発行してくれるため、商品名・型番からの検索やテンプレート差し込みより正確。

interface EasyLinkButton {
  u_tx: string; // ボタン文言（例: "Amazonで見る"）
  u_url: string; // 遷移先URL
  a_id: number;
  p_id: number;
  pc_id: number;
  pl_id: number;
  s_n: string; // ストア識別子（amazon / rakuten / yahoo）
}

interface EasyLinkData {
  n?: string; // 商品名
  b?: string; // ブランド
  t?: string; // 型番
  d?: string; // 画像ベースURL
  c_p?: string; // 画像パスprefix
  p?: string[]; // 画像パスの配列
  b_l?: EasyLinkButton[];
}

export interface ParsedEasyLink {
  productName?: string;
  brand?: string;
  modelNumber?: string;
  imageUrl?: string;
  links: {
    amazon?: string;
    rakuten?: string;
    yahoo?: string;
  };
}

function buildMoshimoClickUrl(button: EasyLinkButton): string {
  const params = new URLSearchParams({
    a_id: String(button.a_id),
    p_id: String(button.p_id),
    pc_id: String(button.pc_id),
    pl_id: String(button.pl_id),
    url: button.u_url,
  });
  return `https://af.moshimo.com/af/c/click?${params.toString()}`;
}

export function parseMoshimoEasyLink(html: string): ParsedEasyLink | null {
  const match = html.match(/msmaflink\(\s*(\{[\s\S]*?\})\s*\)\s*;/);
  if (!match) return null;

  let data: EasyLinkData;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return null;
  }

  const imageUrl =
    data.d && data.c_p && data.p?.[0] ? `${data.d}${data.c_p}${data.p[0]}` : undefined;

  const links: ParsedEasyLink["links"] = {};
  for (const button of data.b_l ?? []) {
    const url = buildMoshimoClickUrl(button);
    if (button.s_n === "amazon") links.amazon = url;
    else if (button.s_n === "rakuten") links.rakuten = url;
    else if (button.s_n === "yahoo") links.yahoo = url;
  }

  return {
    productName: data.n,
    brand: data.b,
    modelNumber: data.t,
    imageUrl,
    links,
  };
}
