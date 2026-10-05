import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // 明確指定專案根目錄，避免 Turbopack 往上找到家目錄的 package-lock.json
    root: __dirname,
  },
};

export default nextConfig;
