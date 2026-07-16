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
  const [amazonUrl, setAmazonUrl] = useState("");
  const [rakutenUrl, setRakutenUrl] = useState("");
  const [yahooUrl, setYahooUrl] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productName.trim()) return;
    onSubmit({
      productName: productName.trim(),
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
        <label htmlFor="amazonUrl">
          Amazon商品URL <span className={styles.hint}>（任意）</span>
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
          楽天商品URL <span className={styles.hint}>（任意）</span>
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
          Yahoo!ショッピング商品URL <span className={styles.hint}>（任意）</span>
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
