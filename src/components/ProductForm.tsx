"use client";

import { useState, FormEvent } from "react";
import { ArticleTemplate, TEMPLATE_LABELS } from "@/types";
import ImageUploader from "./ImageUploader";
import styles from "./ProductForm.module.css";

interface Props {
  onSubmit: (params: {
    productName: string;
    template: ArticleTemplate;
    imageDescription?: string;
  }) => void;
  loading: boolean;
  error: string | null;
}

const TEMPLATES: ArticleTemplate[] = ["review", "comparison", "ranking", "experience"];

export default function ProductForm({ onSubmit, loading, error }: Props) {
  const [productName, setProductName] = useState("");
  const [template, setTemplate] = useState<ArticleTemplate>("review");
  const [imageDescription, setImageDescription] = useState<string | undefined>();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productName.trim()) return;
    onSubmit({ productName: productName.trim(), template, imageDescription });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="productName">商品名</label>
        <input
          id="productName"
          className={styles.input}
          type="text"
          placeholder="例: ワイヤレスイヤホン XYZ-100"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className={styles.field}>
        <label>記事テンプレート</label>
        <div className={styles.templateGroup}>
          {TEMPLATES.map((t) => (
            <button
              type="button"
              key={t}
              className={`${styles.templateButton} ${
                template === t ? styles.templateButtonActive : ""
              }`}
              onClick={() => setTemplate(t)}
              disabled={loading}
            >
              {TEMPLATE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <ImageUploader onAnalyzed={setImageDescription} disabled={loading} />

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submit} disabled={loading || !productName.trim()}>
        {loading ? "記事を生成中..." : "記事を生成する"}
      </button>
    </form>
  );
}
