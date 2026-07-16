"use client";

import { useState } from "react";
import { GenerateArticleResponse } from "@/types";
import { markdownToHtml } from "@/lib/markdown";
import SnsButtons from "./SnsButtons";
import styles from "./ArticleResult.module.css";

interface Props {
  result: GenerateArticleResponse;
  onArticleChange: (article: string) => void;
}

export default function ArticleResult({ result, onArticleChange }: Props) {
  const [rewriting, setRewriting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(result.article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    const blob = new Blob([`# ${result.title}\n\n${result.article}`], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.slice(0, 30) || "article"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRewrite() {
    setRewriting(true);
    setRewriteError(null);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: result.article }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `校正に失敗しました (${res.status})`);
      }
      const data = await res.json();
      onArticleChange(data.article);
    } catch (err) {
      setRewriteError(err instanceof Error ? err.message : "校正に失敗しました");
    } finally {
      setRewriting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div>
        <h2 className={styles.title}>{result.title}</h2>
        {result.title_candidates?.length > 0 && (
          <div className={styles.candidates}>
            <h3>タイトル案</h3>
            {result.title_candidates.map((t, i) => (
              <div key={i} className={styles.candidateItem}>
                ・{t}
              </div>
            ))}
          </div>
        )}
      </div>

      {result.seo_keywords?.length > 0 && (
        <div className={styles.keywords}>
          <h3>SEOキーワード</h3>
          <div className={styles.keywordList}>
            {result.seo_keywords.map((k) => (
              <span key={k} className={styles.keyword}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.links}>
        <h3>アフィリエイトリンク</h3>
        <div className={styles.linkList}>
          {result.affiliate_links.amazon ? (
            <a className={styles.linkItem} href={result.affiliate_links.amazon} target="_blank" rel="noopener noreferrer">
              Amazon
            </a>
          ) : (
            <span className={styles.linkMissing}>Amazonリンク: 未取得</span>
          )}
          {result.affiliate_links.rakuten ? (
            <a className={styles.linkItem} href={result.affiliate_links.rakuten} target="_blank" rel="noopener noreferrer">
              楽天市場
            </a>
          ) : (
            <span className={styles.linkMissing}>楽天リンク: 未取得</span>
          )}
        </div>
      </div>

      <div>
        <h3>記事本文</h3>
        <div
          className={styles.articleBody}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(result.article) }}
        />
      </div>

      <div className={styles.actions}>
        <h3 style={{ width: "100%" }}>操作</h3>
        <button className={styles.button} onClick={handleCopy}>
          記事をコピー
        </button>
        <button className={styles.button} onClick={handleSave}>
          保存（.md）
        </button>
        <button className={styles.button} onClick={handleRewrite} disabled={rewriting}>
          {rewriting ? "校正中..." : "校正・リライト"}
        </button>
        {copied && <span className={styles.copiedNote}>コピーしました</span>}
        {rewriteError && <span className={styles.copiedNote} style={{ color: "#c0392b" }}>{rewriteError}</span>}
      </div>

      <SnsButtons snsTexts={result.sns_texts} />
    </div>
  );
}
