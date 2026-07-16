# ブログ記事プロンプトジェネレーター

商品名と商品URL（Amazon / 楽天 / Yahoo!ショッピング）を入力すると、もしもアフィリエイト経由のアフィリエイトリンクを差し込んだ「Claude Proに貼り付けるブログ記事生成プロンプト」を作成するPWA。

アプリ自身は記事を生成しない。プロンプトを組み立てるだけで、実際の記事執筆はユーザーがClaude Pro（chat.claude.ai）に生成されたプロンプトを貼り付けて行う。外部AI APIを呼び出さないため、APIキーは一切不要。

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
│   │       └── generate-prompt/route.ts  # アフィリエイトリンク生成＋プロンプト組み立て
│   ├── components/
│   │   ├── ProductUrlForm.tsx  # 商品名・各ストアURL入力フォーム
│   │   ├── PromptResult.tsx    # 生成結果表示・コピーUI
│   │   └── ServiceWorkerRegister.tsx
│   ├── lib/
│   │   ├── moshimo.ts          # もしもアフィリエイトリンク生成（サーバー専用）
│   │   └── promptTemplate.ts   # プロンプトテンプレート組み立て（サーバー専用）
│   └── types/index.ts          # 型定義
├── .env.example                 # 環境変数テンプレート
└── package.json
```

## 動作の流れ

1. 商品名・Amazon/楽天/Yahoo!の商品URL（いずれも任意、商品名のみ必須）を入力
2. `/api/generate-prompt` が各URLを `MOSHIMO_LINK_TEMPLATE_*` に差し込み、もしもアフィリエイト経由のリンクを生成
3. 商品名とアフィリエイトリンクを埋め込んだプロンプト文字列を返す
4. 画面上でプロンプトを確認し、「プロンプトをコピー」→ Claude Pro（chat.claude.ai）に貼り付けて記事を生成する

## セキュリティ設計

- 外部AI APIを呼び出さないため、APIキーは存在しない。
- もしもアフィリエイトのリンクテンプレート（`MOSHIMO_LINK_TEMPLATE_*`）はサーバー側の環境変数としてのみ読み込まれ、`NEXT_PUBLIC_` プレフィックスを使っていないためフロントエンドJSに含まれない。
- `src/lib/moshimo.ts` / `promptTemplate.ts` の先頭で `import "server-only"` を宣言しており、誤ってクライアントコンポーネントからimportした場合はビルドエラーになる。
- フロントエンドは `/api/generate-prompt` を `fetch` するのみ。

## セットアップ

```bash
npm install
cp .env.example .env.local   # もしもアフィリエイトのリンクテンプレートを設定
npm run dev                  # http://localhost:3000
```

### 環境変数（`.env.local`）

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `MOSHIMO_LINK_TEMPLATE_AMAZON` | 任意 | もしもアフィリエイト管理画面で発行したAmazon用プロモーションリンクのURLで、遷移先URL部分を`{{URL}}`に置き換えたテンプレート |
| `MOSHIMO_LINK_TEMPLATE_RAKUTEN` | 任意 | 同上（楽天市場） |
| `MOSHIMO_LINK_TEMPLATE_YAHOO` | 任意 | 同上（Yahoo!ショッピング） |

未設定のストアは、入力した商品URLがそのままリンクとして使われる（アフィリエイト経由にはならない）。

もしもアフィリエイト管理画面（https://af.moshimo.com/）で「プロモーション検索」から各ストアのプロモーションを選び、「かんたんリンク」または「プロモーションリンク発行」でリンクを発行し、末尾の `url=` 以降（遷移先の商品URL部分）だけを `{{URL}}` に置き換えて設定する。
例: `MOSHIMO_LINK_TEMPLATE_AMAZON=https://af.moshimo.com/af/c/click?a_id=12345&p_id=678&pc_id=90&pl_id=111&url={{URL}}`

## 機能一覧

1. 商品名入力フォーム
2. Amazon / 楽天 / Yahoo!ショッピングの商品URL入力（任意）
3. もしもアフィリエイト経由のアフィリエイトリンク自動生成
4. Claude Pro貼り付け用のブログ記事生成プロンプトを自動生成
5. 生成されたプロンプトのコピーUI
6. PWA対応（ホーム画面追加・オフラインキャッシュ）

## デプロイ（Vercel）

1. このリポジトリをGitHubにpush
2. [vercel.com](https://vercel.com/) でGitHubリポジトリをインポート
3. Vercelプロジェクトの Environment Variables に `MOSHIMO_LINK_TEMPLATE_*` を設定
4. デプロイ（以後はpushで自動デプロイ）

Service WorkerによるPWA機能を実機で検証するにはHTTPS配信が必要なため、Vercelのデプロイ後のURLで確認すること。
