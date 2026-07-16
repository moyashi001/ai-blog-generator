# AIブログ記事ジェネレーター

商品名を入力すると、Claude APIが商品紹介ブログ記事・SEOキーワード・アフィリエイトリンク・SNS投稿文を自動生成するPWA。

## ディレクトリ構成

```
ai-blog-generator/
├── public/
│   ├── manifest.json          # PWAマニフェスト
│   ├── sw.js                  # Service Worker
│   └── icons/                 # PWAアイコン (192/512)
├── scripts/
│   └── generate-icons.mjs     # アイコン再生成スクリプト
├── src/
│   ├── app/
│   │   ├── page.tsx            # メイン画面 (Client Component)
│   │   ├── layout.tsx          # ルートレイアウト・PWAメタデータ
│   │   └── api/
│   │       ├── generate-article/route.ts  # 記事+リンク+SNS文をまとめて生成
│   │       ├── analyze-image/route.ts     # 商品画像解析 (Claude Vision)
│   │       ├── affiliate-links/route.ts   # アフィリエイトリンク単体取得
│   │       ├── rewrite/route.ts           # 記事の校正・リライト
│   │       └── sns-text/route.ts          # SNS投稿文単体生成
│   ├── components/             # UIコンポーネント
│   ├── lib/
│   │   ├── claude.ts           # Claude API呼び出し（サーバー専用）
│   │   ├── amazon.ts           # Amazon PA-API + フォールバック（サーバー専用）
│   │   ├── rakuten.ts          # 楽天市場商品検索API（サーバー専用）
│   │   ├── moshimo.ts          # もしもアフィリエイトリンク生成（サーバー専用）
│   │   ├── prompts.ts          # Claude向けプロンプトテンプレート
│   │   └── markdown.ts         # 簡易Markdown→HTML変換
│   └── types/index.ts          # 型定義
├── .env.example                 # 環境変数テンプレート
└── package.json
```

## セキュリティ設計

- APIキー（`CLAUDE_API_KEY` / `AMAZON_*` / `RAKUTEN_*` / `MOSHIMO_*`）はすべて **サーバー側の環境変数** としてのみ読み込まれる。
- `NEXT_PUBLIC_` プレフィックスの環境変数は一切使用していないため、これらの値はビルド後のフロントエンドJSに含まれない。
- キーを読むファイル（`src/lib/claude.ts` / `amazon.ts` / `rakuten.ts` / `moshimo.ts`）の先頭で `import "server-only"` を宣言しており、誤ってクライアントコンポーネントからimportした場合はビルドエラーになる。
- フロントエンド（`src/components/*`, `src/app/page.tsx`）は `/api/*` の自前エンドポイントを `fetch` するのみで、外部APIには直接アクセスしない。

## セットアップ

```bash
npm install
cp .env.example .env.local   # 実際のAPIキーを .env.local に設定
npm run dev                  # http://localhost:3000
```

### 必要な環境変数（`.env.local`）

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `CLAUDE_API_KEY` | ○ | 記事生成・画像解析に必須。[console.anthropic.com](https://console.anthropic.com/)で取得。 |
| `RAKUTEN_APP_ID` | 記事生成機能に必須 | 楽天ウェブサービスで無料取得（審査不要）。 |
| `RAKUTEN_AFFILIATE_ID` | 任意 | 設定すると楽天の検索結果にアフィリエイトURLが付与される。 |
| `AMAZON_ACCESS_KEY` / `AMAZON_SECRET_KEY` / `AMAZON_ASSOCIATE_TAG` | 任意 | PA-API 5.0の認証情報。個人アソシエイトはアソシエイトリンク経由で一定の売上実績が無いと申請できないため、未設定時は検索リンクへのフォールバックで動作する。 |
| `MOSHIMO_LINK_TEMPLATE_AMAZON` / `_RAKUTEN` / `_YAHOO` | 任意 | もしもアフィリエイト管理画面で発行した「プロモーションリンク（W2A / かんたんリンク）」のURLで、遷移先URL部分を `{{URL}}` に置き換えたテンプレート。設定すると各ストアへのリンクがもしもアフィリエイト経由になる。 |

もしもアフィリエイトには汎用の商品検索APIが公開されていないため、動的な商品URL生成にはW2A形式のプロモーションリンクテンプレートを利用する方式にしている。実際のパラメータ名・値はもしもアフィリエイト管理画面の「プロモーションリンク発行」画面で確認すること。

## 機能一覧

1. 商品名入力フォーム
2. 記事テンプレート選択（レビュー / 比較 / ランキング / 体験談）
3. 商品画像アップロード → Claude Visionで解析 → 記事本文に反映
4. Claude APIによるブログ記事生成（タイトル案・SEOキーワード・本文）
5. Amazon / 楽天のアフィリエイトリンク自動生成
6. SNS投稿文自動生成（X / Instagram / TikTok）
7. 記事の校正・リライト
8. コピー / 保存（.md） / 再校正の操作ボタン
9. PWA対応（ホーム画面追加・オフラインキャッシュ）

※ Amazonレビュー要約機能は、公式スクレイピングが利用規約違反・アカウント停止リスクを伴うため実装していません。

## デプロイ（Vercel）

1. このリポジトリをGitHubにpush
2. [vercel.com](https://vercel.com/) でGitHubリポジトリをインポート
3. Vercelプロジェクトの Environment Variables に `.env.example` と同じキーを設定
4. デプロイ（以後はpushで自動デプロイ）

Service WorkerによるPWA機能を実機で検証するにはHTTPS配信が必要なため、Vercelのデプロイ後のURLで確認すること。
