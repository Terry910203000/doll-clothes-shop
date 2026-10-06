import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 商品圖存到 R2 之後網址會在別的網域上，
// next/image 預設只允許同站圖片，所以要把它列為可信來源。
const remotePatterns = [];
if (process.env.R2_PUBLIC_URL) {
  try {
    const { protocol, hostname } = new URL(process.env.R2_PUBLIC_URL);
    remotePatterns.push({ protocol: protocol.replace(":", ""), hostname });
  } catch {
    console.warn("R2_PUBLIC_URL 不是合法網址，已略過 next/image 設定");
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns },
  turbopack: {
    // 明確指定專案根目錄，避免 Turbopack 往上找到家目錄的 package-lock.json
    root: __dirname,
  },
};

export default nextConfig;
