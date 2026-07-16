"use client";

import { useState } from "react";
import ProductForm from "@/components/ProductForm";
import ArticleResult from "@/components/ArticleResult";
import { ArticleTemplate, GenerateArticleResponse } from "@/types";
import styles from "./page.module.css";

export default function Home() {
  const [result, setResult] = useState<GenerateArticleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(params: {
    productName: string;
    template: ArticleTemplate;
    imageDescription?: string;
  }) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `記事生成に失敗しました (${res.status})`);
      }
      const data: GenerateArticleResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "記事生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>AIブログ記事ジェネレーター</h1>
        <p>商品名を入力するだけで、AIが紹介記事とアフィリエイトリンク・SNS投稿文を自動生成します。</p>
      </header>

      <main className={styles.main}>
        <ProductForm onSubmit={handleSubmit} loading={loading} error={error} />
        {result && (
          <ArticleResult
            result={result}
            onArticleChange={(article) => setResult({ ...result, article })}
          />
        )}
      </main>
    </div>
  );
}
