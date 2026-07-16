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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productName.trim()) return;
    onSubmit({
      productName: productName.trim(),
      amazonUrl: amazonUrl.trim() || undefined,
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
        <span className={styles.hint}>楽天・Yahoo!ショッピングの商品リンクはこの商品名から自動検索します</span>
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

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submit} disabled={loading || !productName.trim()}>
        {loading ? "生成中..." : "プロンプトを生成する"}
      </button>
    </form>
  );
}
