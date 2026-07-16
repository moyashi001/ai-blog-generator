"use client";

import { useState } from "react";
import { SnsTexts } from "@/types";
import styles from "./ArticleResult.module.css";

const PLATFORM_LABELS: Record<keyof SnsTexts, string> = {
  twitter: "X (Twitter)",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export default function SnsButtons({ snsTexts }: { snsTexts: SnsTexts }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function handleCopy(key: keyof SnsTexts) {
    await navigator.clipboard.writeText(snsTexts[key]);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div>
      <h3>SNS投稿文</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "0.5rem" }}>
        {(Object.keys(snsTexts) as (keyof SnsTexts)[]).map((key) => (
          <div key={key} style={{ background: "#f5f5f5", padding: "0.7rem", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
              {PLATFORM_LABELS[key]}
            </div>
            <div style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>{snsTexts[key]}</div>
            <button className={styles.button} style={{ marginTop: "0.5rem" }} onClick={() => handleCopy(key)}>
              {copiedKey === key ? "コピーしました" : "コピー"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
