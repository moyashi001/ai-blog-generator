"use client";

import { useState, FormEvent } from "react";
import { GeneratePromptRequest } from "@/types";
import styles from "./ProductUrlForm.module.css";

interface Props {
  onSubmit: (params: GeneratePromptRequest) => void;
  loading: boolean;
  error: string | null;
}

export default function ProductUrlForm({ onSubmit, loading, error }: Props) {
  const [productName, setProductName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [rakutenUrl, setRakutenUrl] = useState("");
  const [yahooUrl, setYahooUrl] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productName.trim()) return;
    onSubmit({
      productName: productName.trim(),
      modelNumber: modelNumber.trim() || undefined,
      amazonUrl: amazonUrl.trim() || undefined,
      rakutenUrl: rakutenUrl.trim() || undefined,
      yahooUrl: yahooUrl.trim() || undefined,
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="productName">商品名</label>
        <input
          id="productName"
          className={styles.input}
          type="text"
          placeholder="例: Anker モバイルバッテリー 10000mAh"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="modelNumber">
          型番 <span className={styles.hint}>（任意・入力時は楽天/Yahoo!の検索でこちらを優先）</span>
        </label>
        <input
          id="modelNumber"
          className={styles.input}
          type="text"
          placeholder="例: A1257"
          value={modelNumber}
          onChange={(e) => setModelNumber(e.target.value)}
          disabled={loading}
        />
        <span className={styles.hint}>楽天・Yahoo!ショッピングの商品リンクは型番（未入力時は商品名）から自動検索します</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="amazonUrl">
          Amazon商品URL <span className={styles.hint}>（任意・自動検索非対応のため手動入力）</span>
        </label>
        <input
          id="amazonUrl"
          className={styles.input}
          type="url"
          placeholder="https://www.amazon.co.jp/dp/..."
          value={amazonUrl}
          onChange={(e) => setAmazonUrl(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="rakutenUrl">
          楽天商品URL <span className={styles.hint}>（任意・自動検索結果が違う場合はこちらを優先）</span>
        </label>
        <input
          id="rakutenUrl"
          className={styles.input}
          type="url"
          placeholder="https://item.rakuten.co.jp/..."
          value={rakutenUrl}
          onChange={(e) => setRakutenUrl(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="yahooUrl">
          Yahoo!ショッピング商品URL <span className={styles.hint}>（任意・自動検索結果が違う場合はこちらを優先）</span>
        </label>
        <input
          id="yahooUrl"
          className={styles.input}
          type="url"
          placeholder="https://store.shopping.yahoo.co.jp/..."
          value={yahooUrl}
          onChange={(e) => setYahooUrl(e.target.value)}
          disabled={loading}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submit} disabled={loading || !productName.trim()}>
        {loading ? "生成中..." : "プロンプトを生成する"}
      </button>
    </form>
  );
}
