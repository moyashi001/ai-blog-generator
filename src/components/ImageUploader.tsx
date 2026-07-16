"use client";

import { useState, ChangeEvent } from "react";
import styles from "./ImageUploader.module.css";

interface Props {
  onAnalyzed: (description: string) => void;
  disabled?: boolean;
}

function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [meta, base64] = result.split(",");
      const mediaType = meta.match(/data:(.*);base64/)?.[1] ?? file.type;
      resolve({ base64, mediaType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ onAnalyzed, disabled }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDescription(null);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalyzing(true);

    try {
      const { base64, mediaType } = await fileToBase64(file);
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `画像解析に失敗しました (${res.status})`);
      }
      const data = await res.json();
      setDescription(data.description);
      onAnalyzed(data.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : "画像解析に失敗しました");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>商品画像（任意）</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={disabled || analyzing}
        className={styles.input}
      />
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="アップロードした商品画像" className={styles.preview} />
      )}
      {analyzing && <p className={styles.status}>画像を解析中...</p>}
      {description && <p className={styles.description}>解析結果: {description}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
