"use client";

import { useState } from "react";
import ProductUrlForm from "@/components/ProductUrlForm";
import PromptResult from "@/components/PromptResult";
import { GeneratePromptRequest, GeneratePromptResponse } from "@/types";
import styles from "./page.module.css";

export default function Home() {
  const [result, setResult] = useState<GeneratePromptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(params: GeneratePromptRequest) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `プロンプト生成に失敗しました (${res.status})`);
      }
      const data: GeneratePromptResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "プロンプト生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>ブログ記事プロンプトジェネレーター</h1>
        <p>
          商品名と商品URLを入力すると、アフィリエイトリンクを差し込んだ
          Claude Pro貼り付け用プロンプトを自動生成します。
        </p>
      </header>

      <main className={styles.main}>
        <ProductUrlForm onSubmit={handleSubmit} loading={loading} error={error} />
        {result && <PromptResult result={result} />}
      </main>
    </div>
  );
}
