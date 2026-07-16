import "server-only";

// もしもアフィリエイトには汎用の商品検索APIが公開されていないため、
// 管理画面の「プロモーションリンク発行（W2A / かんたんリンク）」で発行される
// リンクURLをテンプレートとして環境変数に設定し、遷移先URL部分だけ差し替える方式にする。
//
// 設定例（もしもアフィリエイト管理画面で発行したリンクの遷移先URL部分を {{URL}} に置き換えたもの）:
//   MOSHIMO_LINK_TEMPLATE_AMAZON=https://af.moshimo.com/af/c/click?a_id=XXXX&p_id=XXXX&pc_id=XXXX&pl_id=XXXX&url={{URL}}
//   MOSHIMO_LINK_TEMPLATE_RAKUTEN=https://af.moshimo.com/af/c/click?a_id=XXXX&p_id=XXXX&pc_id=XXXX&pl_id=XXXX&url={{URL}}
//   MOSHIMO_LINK_TEMPLATE_YAHOO=https://af.moshimo.com/af/c/click?a_id=XXXX&p_id=XXXX&pc_id=XXXX&pl_id=XXXX&url={{URL}}

export type MoshimoStore = "amazon" | "rakuten" | "yahoo";

const TEMPLATE_ENV_KEY: Record<MoshimoStore, string> = {
  amazon: "MOSHIMO_LINK_TEMPLATE_AMAZON",
  rakuten: "MOSHIMO_LINK_TEMPLATE_RAKUTEN",
  yahoo: "MOSHIMO_LINK_TEMPLATE_YAHOO",
};

// テンプレートが設定されていれば destinationUrl を差し込んだアフィリエイトリンクを返す。
// 未設定の場合は null を返す（呼び出し側は destinationUrl をそのまま使う）。
export function buildMoshimoLink(store: MoshimoStore, destinationUrl: string): string | null {
  const template = process.env[TEMPLATE_ENV_KEY[store]];
  if (!template) return null;
  return template.replace("{{URL}}", encodeURIComponent(destinationUrl));
}
