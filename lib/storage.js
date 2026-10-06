import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * 商品圖片的存放層。
 *
 * 設定了 S3_* 就上傳到 S3 相容的物件儲存（Supabase Storage、Cloudflare R2
 * 都支援這個協定），否則存本機 public/uploads/。
 * 外面只呼叫 saveImage / deleteImage，換儲存服務不必改用到的地方。
 */

const MAX_UPLOAD = 12 * 1024 * 1024; // 12MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

export function storageDriver() {
  const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET } = process.env;
  return S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY && S3_BUCKET
    ? "s3"
    : "local";
}

function publicBase() {
  return (process.env.S3_PUBLIC_URL ?? "").replace(/\/+$/, "");
}

let clientPromise;

async function s3Client() {
  // 只有真的要用到時才載入 SDK，本機模式不必付出這段載入成本
  clientPromise ??= import("@aws-sdk/client-s3").then(({ S3Client }) => ({
    client: new S3Client({
      region: process.env.S3_REGION ?? "auto",
      endpoint: process.env.S3_ENDPOINT,
      // Supabase Storage 的 S3 介面只接受 path-style 網址
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    }),
  }));
  return clientPromise;
}

/**
 * 把上傳的檔案壓成網頁用的 WebP 後存起來，回傳可直接放進 <img src> 的網址。
 *
 * 一律用 sharp 重新編碼：既壓掉手機原圖的龐大體積，
 * 也等於過濾掉偽裝成圖片的檔案（解不開就會丟例外）。
 */
export async function saveImage(file) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > MAX_UPLOAD) throw new Error("圖片超過 12MB");
  if (!ALLOWED.has(file.type)) throw new Error("只接受 JPG / PNG / WebP / AVIF");

  const body = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate() // 依 EXIF 轉正
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();

  const key = `${randomUUID()}.webp`;

  if (storageDriver() === "local") {
    await mkdir(LOCAL_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_DIR, key), body);
    return `/uploads/${key}`;
  }

  const { client } = await s3Client();
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${publicBase()}/${key}`;
}

/** 刪掉自己上傳的檔案。種子商品的圖在 public/products/ 下，不會被動到 */
export async function deleteImage(url) {
  if (!url) return;

  try {
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(LOCAL_DIR, url.replace("/uploads/", "")));
      return;
    }

    const base = publicBase();
    if (!base || !url.startsWith(base)) return;

    const { client } = await s3Client();
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: url.slice(base.length + 1),
      }),
    );
  } catch {
    // 檔案本來就不在，或遠端暫時連不上；
    // 不該因為清不掉舊檔就讓整個刪除商品的操作失敗
  }
}
