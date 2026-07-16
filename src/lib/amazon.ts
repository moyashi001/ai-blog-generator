import "server-only";
import crypto from "crypto";
import { buildMoshimoLink } from "./moshimo";

// Amazon Product Advertising API 5.0 (PA-API) 実装例。
// PA-API はアソシエイト経由の売上実績（180日以内に3件など）が無いと利用申請が通らないため、
// AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY が未設定の場合は「もしもアフィリエイト」経由の
// Amazon検索リンクにフォールバックする。
// 参考: https://webservices.amazon.co.jp/paapi5/documentation/

const HOST = "webservices.amazon.co.jp";
const REGION = "us-west-2";
const SERVICE = "ProductAdvertisingAPI";
const TARGET = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems";
const ENDPOINT = `https://${HOST}/paapi5/searchitems`;

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

// AWS Signature Version 4 で PA-API リクエストに署名する
function signRequest(payload: string, accessKey: string, secretKey: string) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${TARGET}\n`;
  const signedHeaders = "content-encoding;host;x-amz-date;x-amz-target";

  const canonicalRequest = [
    "POST",
    "/paapi5/searchitems",
    "",
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join("\n");

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString("hex");

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { amzDate, authorizationHeader };
}

export interface AmazonProductResult {
  title: string;
  url: string;
  price?: string;
  imageUrl?: string;
}

async function searchViaPaApi(keyword: string): Promise<AmazonProductResult | null> {
  const accessKey = process.env.AMAZON_ACCESS_KEY!;
  const secretKey = process.env.AMAZON_SECRET_KEY!;
  const partnerTag = process.env.AMAZON_ASSOCIATE_TAG!;

  const payload = JSON.stringify({
    Keywords: keyword,
    Resources: ["ItemInfo.Title", "Images.Primary.Medium", "Offers.Listings.Price"],
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.co.jp",
  });

  const { amzDate, authorizationHeader } = signRequest(payload, accessKey, secretKey);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: HOST,
      "x-amz-date": amzDate,
      "x-amz-target": TARGET,
      Authorization: authorizationHeader,
    },
    body: payload,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Amazon PA-API error: ${res.status} ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const item = data?.SearchResult?.Items?.[0];
  if (!item) return null;

  return {
    title: item.ItemInfo?.Title?.DisplayValue ?? keyword,
    url: item.DetailPageURL,
    price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount,
    imageUrl: item.Images?.Primary?.Medium?.URL,
  };
}

// PA-APIキー未設定時のフォールバック: もしもアフィリエイト経由のAmazon検索リンクを生成
function fallbackSearchLink(keyword: string): AmazonProductResult {
  const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}`;
  const tag = process.env.AMAZON_ASSOCIATE_TAG;
  const directUrl = tag ? `${searchUrl}&tag=${encodeURIComponent(tag)}` : searchUrl;
  const url = buildMoshimoLink("amazon", directUrl) ?? directUrl;

  return { title: keyword, url };
}

export async function searchAmazonItem(keyword: string): Promise<AmazonProductResult> {
  const hasPaApiCredentials =
    process.env.AMAZON_ACCESS_KEY &&
    process.env.AMAZON_SECRET_KEY &&
    process.env.AMAZON_ASSOCIATE_TAG;

  if (hasPaApiCredentials) {
    try {
      const result = await searchViaPaApi(keyword);
      if (result) return result;
    } catch (err) {
      console.error("PA-API search failed, falling back to search link:", err);
    }
  }

  return fallbackSearchLink(keyword);
}
