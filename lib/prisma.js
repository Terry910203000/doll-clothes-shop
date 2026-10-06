import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

/**
 * Prisma 連線。
 *
 * Next.js 開發模式每次存檔都會重新載入模組，若每次都 new 一個 PrismaClient
 * 連線數會一路累積到資料庫拒絕連線，所以把實例掛在 globalThis 上重複使用。
 * 正式環境只會載入一次，不需要這層保護。
 */
const createClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
