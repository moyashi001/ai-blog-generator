# ブログ記事プロンプトジェネレーター

商品名または型番を入力すると、楽天・Yahoo!ショッピングの商品リンクを自動検索し（Amazonのみ手動でURLを指定）、もしもアフィリエイト経由のリンクを差し込んだ「Claude Proに貼り付けるブログ記事生成プロンプト」を作成するPWA。もしもアフィリエイトの「かんたんリンク」埋め込みコードを貼り付ければ、商品名・型番・画像・Amazon/楽天/Yahoo!の3ストアリンクをすべて一括取得できる（検索・個別URL入力は不要になる）。生成されるプロンプトはブログ「もや暮らし」（https://moyagurashi.com/）の文体を踏襲するよう指示しており、記事に載せたい画像のURL・説明も任意で組み込める。

アプリ自身は記事を生成しない。プロンプトを組み立てるだけで、実際の記事執筆はユーザーがClaude Pro（chat.claude.ai）に生成されたプロンプトを貼り付けて行う。外部AI APIを呼び出さないため、AI用のAPIキーは一切不要。

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
│   │       └── generate-prompt/route.ts  # 商品検索＋アフィリエイトリンク生成＋プロンプト組み立て
│   ├── components/
│   │   ├── ProductUrlForm.tsx  # 商品名・Amazon URL入力フォーム
│   │   ├── PromptResult.tsx    # 生成結果表示・コピーUI
│   │   └── ServiceWorkerRegister.tsx
│   ├── lib/
│   │   ├── rakuten.ts          # 楽天市場商品検索API（サーバー専用）
│   │   ├── yahoo.ts            # Yahoo!ショッピング商品検索API（サーバー専用）
│   │   ├── moshimo.ts          # もしもアフィリエイトリンク生成（サーバー専用）
│   │   ├── moshimoEasyLink.ts  # もしもアフィリエイト「かんたんリンク」埋め込みコードの解析（サーバー専用）
│   │   └── promptTemplate.ts   # プロンプトテンプレート組み立て（サーバー専用）
│   └── types/index.ts          # 型定義
├── .env.example                 # 環境変数テンプレート
└── package.json
```

## 動作の流れ

### パターンA: もしもアフィリエイトの「かんたんリンク」を使う（推奨・最も正確）

1. もしもアフィリエイト管理画面で対象商品の「かんたんリンク」を発行し、埋め込みコード（`<!-- START MoshimoAffiliateEasyLink -->`から始まるHTML）をコピー
2. アプリのフォーム上部にある「もしもアフィリエイトの『かんたんリンク』埋め込みコード」欄に貼り付ける（他の商品名・URL入力欄は自動的に無効化される）
3. `/api/generate-prompt` が埋め込みコード内の`msmaflink({...})`のJSONを解析し、商品名・型番・商品画像URL・Amazon/楽天/Yahoo!それぞれの正確なアフィリエイトクリックURL（`a_id`/`p_id`/`pc_id`/`pl_id`込み）を一括取得する
4. `pl_id`（プロモーションリンクID）は商品ごとに個別発行される値のため、固定テンプレート（パターンB）より正確なアフィリエイト計測ができる

### パターンB: 商品名・型番から検索する（かんたんリンクを使わない場合）

1. 商品名・型番（どちらか一方は必須）・Amazon商品URL（任意）・楽天/Yahoo!商品URL（任意）・記事に載せる画像URLと内容（任意）を入力
2. `/api/generate-prompt` が、楽天/Yahoo!のURLが手動入力されていなければ、型番（未入力なら商品名）をキーワードに楽天市場商品検索API・Yahoo!ショッピング商品検索APIを呼び出し、該当ストアの商品URLを自動取得
3. Amazon（常に手動入力）・楽天・Yahoo!それぞれのURLを `MOSHIMO_LINK_TEMPLATE_*` に差し込み、もしもアフィリエイト経由のリンクを生成。楽天・Yahoo!は検索結果の商品画像URLも取得する（Amazonは画像URLも手動入力）。3ストアの画像はAmazon→楽天→Yahoo!の優先順で1枚だけ代表画像として採用する

Amazonのみ自動検索していない。理由はAmazon公式のPA-APIが個人アソシエイトの場合アソシエイトリンク経由の売上実績が無いと申請できない審査制のため。楽天・Yahoo!は無料・審査不要の商品検索APIがあるため自動化しているが、検索結果が誤っている場合に備えて手動URL入力で上書きもできる。

商品検索は完全一致（LIKE検索）ではなく形態素解析による関連度順のキーワード検索のため、型番やブランド名を含めた具体的なキーワードほど精度が上がる。型番が入力されている場合は商品名より型番を優先して検索する。

### 共通の後続処理

4. 商品名（または型番）・アフィリエイトリンク・代表画像URL・画像情報・文体ガイド（もや暮らし https://moyagurashi.com/ の文体を踏襲する指示）・3ストアのリンクを1つの商品紹介カード（画像1枚＋商品名＋Amazon/楽天/Yahoo!の3ボタン横並び）としてHTML出力する指示を埋め込んだプロンプト文字列を返す
5. 画面上でプロンプトを確認し、「プロンプトをコピー」→ Claude Pro（chat.claude.ai）に貼り付けて記事を生成する

## セキュリティ設計

- 外部AI APIを呼び出さないため、AI用のAPIキーは存在しない。
- 楽天/Yahoo!の商品検索APIキー、もしもアフィリエイトのリンクテンプレートはすべてサーバー側の環境変数としてのみ読み込まれ、`NEXT_PUBLIC_` プレフィックスを使っていないためフロントエンドJSに含まれない。
- `src/lib/*.ts` の先頭で `import "server-only"` を宣言しており、誤ってクライアントコンポーネントからimportした場合はビルドエラーになる。
- フロントエンドは `/api/generate-prompt` を `fetch` するのみ。

## セットアップ

```bash
npm install
cp .env.example .env.local   # 各種キー・リンクテンプレートを設定
npm run dev                  # http://localhost:3000
```

### 環境変数（`.env.local`）

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `RAKUTEN_APP_ID` | 楽天の自動検索に必須 | 楽天ウェブサービス（https://webservice.rakuten.co.jp/）で無料取得（審査不要） |
| `RAKUTEN_ACCESS_KEY` | 楽天の自動検索に必須 | 2026年の仕様変更で追加された必須項目。アプリ管理画面の「アクセスキー」欄（目のアイコンで表示） |
| `RAKUTEN_APP_ORIGIN` | 楽天の自動検索に必須 | 楽天アプリ管理画面に登録した「アプリケーションURL」と同じ値（例: `https://your-app.vercel.app/`）。不一致だと403 HTTP_REFERRER_NOT_ALLOWEDになる |
| `RAKUTEN_AFFILIATE_ID` | 任意 | 楽天アフィリエイトの管理画面のアフィリエイトID |
| `YAHOO_APP_ID` | Yahoo!の自動検索に必須 | Yahoo!デベロッパーネットワーク（https://developer.yahoo.co.jp/）で無料取得（審査不要） |
| `MOSHIMO_LINK_TEMPLATE_AMAZON` | 任意 | もしもアフィリエイト管理画面で発行したAmazon用プロモーションリンクのURLで、遷移先URL部分を`{{URL}}`に置き換えたテンプレート |
| `MOSHIMO_LINK_TEMPLATE_RAKUTEN` | 任意 | 同上（楽天市場） |
| `MOSHIMO_LINK_TEMPLATE_YAHOO` | 任意 | 同上（Yahoo!ショッピング） |

`RAKUTEN_APP_ID` / `RAKUTEN_ACCESS_KEY` / `RAKUTEN_APP_ORIGIN` / `YAHOO_APP_ID` が未設定の場合、そのストアのリンクは生成されない（「未設定」と表示される）。`MOSHIMO_LINK_TEMPLATE_*` が未設定のストアは、検索または入力したURLがそのままリンクとして使われる（アフィリエイト経由にはならない）。

もしもアフィリエイト管理画面（https://af.moshimo.com/）で「プロモーション検索」から各ストアのプロモーションを選び、「かんたんリンク」または「プロモーションリンク発行」でリンクを発行し、末尾の `url=` 以降（遷移先の商品URL部分）だけを `{{URL}}` に置き換えて設定する。
例: `MOSHIMO_LINK_TEMPLATE_AMAZON=https://af.moshimo.com/af/c/click?a_id=12345&p_id=678&pc_id=90&pl_id=111&url={{URL}}`

## 機能一覧

1. もしもアフィリエイトの「かんたんリンク」埋め込みコード貼り付け（商品名・型番・画像・3ストアリンクを一括取得）
2. 商品名・型番の入力フォーム（どちらか一方でも生成可能・かんたんリンク未使用時）
3. Amazon商品URL・商品画像URL入力（任意・手動）
4. 楽天市場・Yahoo!ショッピングの商品リンク・商品画像URLを商品名（または型番）から自動検索、手動URL入力での上書きも可能
5. もしもアフィリエイト経由のアフィリエイトリンク自動生成
6. 記事に載せる画像のURL・内容入力（任意）→ プロンプトに`<img>`タグ挿入の指示として反映
7. Claude Pro貼り付け用のブログ記事生成プロンプトを自動生成（WordPress SWELLにそのまま貼り付けられるHTML出力、ブログ「もや暮らし」の文体を踏襲する指示、アフィリエイトリンクを商品画像＋ボタンのカード形式で出力する指示）
8. 生成されたプロンプトのコピーUI
9. PWA対応（ホーム画面追加・オフラインキャッシュ）

## デプロイ（Vercel）

1. このリポジトリをGitHubにpush
2. [vercel.com](https://vercel.com/) でGitHubリポジトリをインポート
3. Vercelプロジェクトの Environment Variables に上記の環境変数を設定
4. デプロイ（以後はpushで自動デプロイ）

Service WorkerによるPWA機能を実機で検証するにはHTTPS配信が必要なため、Vercelのデプロイ後のURLで確認すること。
