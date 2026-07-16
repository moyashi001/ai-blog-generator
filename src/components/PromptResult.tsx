"use client";

import { useState } from "react";
import { GeneratePromptResponse } from "@/types";
import styles from "./PromptResult.module.css";

export default function PromptResult({ result }: { result: GeneratePromptResponse }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.links}>
        <h3>アフィリエイトリンク</h3>
        <div className={styles.linkList}>
          {result.affiliateLinks.amazon ? (
            <a className={styles.linkItem} href={result.affiliateLinks.amazon} target="_blank" rel="noopener noreferrer">
              Amazon
            </a>
          ) : (
            <span className={styles.linkMissing}>Amazon: 未設定</span>
          )}
          {result.affiliateLinks.rakuten ? (
            <a className={styles.linkItem} href={result.affiliateLinks.rakuten} target="_blank" rel="noopener noreferrer">
              楽天市場
            </a>
          ) : (
            <span className={styles.linkMissing}>楽天: 未設定</span>
          )}
          {result.affiliateLinks.yahoo ? (
            <a className={styles.linkItem} href={result.affiliateLinks.yahoo} target="_blank" rel="noopener noreferrer">
              Yahoo!ショッピング
            </a>
          ) : (
            <span className={styles.linkMissing}>Yahoo!: 未設定</span>
          )}
        </div>
      </div>

      <div className={styles.promptSection}>
        <h3>Claude Proに貼り付けるプロンプト</h3>
        <textarea className={styles.promptBox} value={result.prompt} readOnly />
      </div>

      <div className={styles.actions}>
        <button className={styles.button} onClick={handleCopy}>
          プロンプトをコピー
        </button>
        {copied && <span className={styles.copiedNote}>コピーしました</span>}
      </div>
    </div>
  );
}
