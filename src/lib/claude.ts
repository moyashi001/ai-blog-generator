import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildArticlePrompt,
  buildRewritePrompt,
  buildSnsPrompt,
  IMAGE_ANALYSIS_PROMPT,
} from "./prompts";
import { ArticleTemplate, SnsTexts } from "@/types";

const MODEL = "claude-sonnet-5";

function getClient(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY is not set on the server");
  }
  return new Anthropic({ apiKey });
}

// Claudeの応答からJSON部分だけを抽出する（```json ... ``` で囲まれるケースに対応）
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fenced ? fenced[1] : trimmed;
  return JSON.parse(jsonText);
}

function getTextFromMessage(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

export async function generateArticleContent(params: {
  productName: string;
  template: ArticleTemplate;
  imageDescription?: string;
}): Promise<{ title: string; title_candidates: string[]; seo_keywords: string[]; article: string }> {
  const client = getClient();
  const prompt = buildArticlePrompt(params);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = getTextFromMessage(message);
  const parsed = extractJson(text) as {
    title: string;
    title_candidates: string[];
    seo_keywords: string[];
    article: string;
  };
  return parsed;
}

export async function rewriteArticleContent(
  article: string,
  instruction?: string
): Promise<string> {
  const client = getClient();
  const prompt = buildRewritePrompt(article, instruction);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  return getTextFromMessage(message).trim();
}

export async function generateSnsTextsContent(
  title: string,
  article: string
): Promise<SnsTexts> {
  const client = getClient();
  const prompt = buildSnsPrompt(title, article);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = getTextFromMessage(message);
  return extractJson(text) as SnsTexts;
}

export async function analyzeImageContent(
  imageBase64: string,
  mediaType: string
): Promise<string> {
  const client = getClient();

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text", text: IMAGE_ANALYSIS_PROMPT },
        ],
      },
    ],
  });

  return getTextFromMessage(message).trim();
}
