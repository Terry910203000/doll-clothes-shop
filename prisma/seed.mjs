/**
 * 建立初始資料：分類、17 件商品（含真實照片）、一個管理員帳號。
 *
 * 用法：npm run db:seed
 * 會先清空 商品/分類 再重建，所以可以重複執行。
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

// 側邊選單的分類
const categories = [
  { slug: "day6", name: "Day6", sortOrder: 1 },
  { slug: "svt-30cm", name: "SVT 30CM", sortOrder: 2 },
  { slug: "16cm", name: "16CM", sortOrder: 3 },
  { slug: "10cm", name: "10CM", sortOrder: 4 },
];

// 17 件商品。photo 對應 public/products/cloth{n}-front.webp 與 -back.webp
// TODO: 品名、價格、分類目前是依照片內容暫訂，請在後台或這裡改成實際資料
const products = [
  { photo: 1, name: "格紋襯衫 × 單寧吊帶褲", category: "day6", price: 680, back: true },
  { photo: 2, name: "格紋襯衫 × 單寧吊帶褲（深藍）", category: "day6", price: 680, back: true },
  { photo: 3, name: "細格紋襯衫 × 吊帶短褲", category: "day6", price: 650, back: true },
  { photo: 4, name: "白領襯衫 × 單寧吊帶褲", category: "day6", price: 700, back: true },
  { photo: 5, name: "棕格襯衫 × 吊帶短褲", category: "day6", price: 650, back: true },
  { photo: 6, name: "碎花罩衫 × 單寧短褲", category: "svt-30cm", price: 620, back: true },
  { photo: 7, name: "淺色碎花罩衫套組", category: "svt-30cm", price: 620, back: true },
  { photo: 8, name: "滿版碎花上衣 × 單寧短褲", category: "svt-30cm", price: 640, back: true },
  { photo: 9, name: "鵝黃碎花洋裝", category: "16cm", price: 580 },
  { photo: 10, name: "鵝黃碎花洋裝（雙入組）", category: "16cm", price: 1080 },
  { photo: 11, name: "鵝黃上衣 × 灰藍紗裙", category: "16cm", price: 720 },
  { photo: 12, name: "碎花洋裝 × 藍色綁帶", category: "16cm", price: 600 },
  { photo: 13, name: "碎花荷葉短裙套組", category: "10cm", price: 560 },
  { photo: 14, name: "米白蕾絲荷葉洋裝", category: "10cm", price: 760 },
  { photo: 15, name: "單寧襯衫套組", category: "svt-30cm", price: 690 },
  { photo: 16, name: "紅花上衣 × 單寧短褲", category: "svt-30cm", price: 660, back: true },
  { photo: 17, name: "單寧荷葉吊帶褲", category: "svt-30cm", price: 710 },
];

// 首頁主打商品
const featured = {
  1: "限量預購中",
  11: "NEW",
  14: "BEST",
};

const sizes = [
  { size: "S", stock: 20, sortOrder: 1 },
  { size: "M", stock: 20, sortOrder: 2 },
  { size: "L", stock: 20, sortOrder: 3 },
];

async function main() {
  // 商品與分類每次重建，會員與訂單保留
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryIds = {};
  for (const c of categories) {
    const row = await prisma.category.create({ data: c });
    categoryIds[c.slug] = row.id;
  }
  console.log(`分類 ${categories.length} 筆`);

  for (const [i, p] of products.entries()) {
    const images = [{ url: `/products/cloth${p.photo}-front.webp`, alt: `${p.name} 正面`, sortOrder: 1 }];
    if (p.back) {
      images.push({ url: `/products/cloth${p.photo}-back.webp`, alt: `${p.name} 反面`, sortOrder: 2 });
    }

    await prisma.product.create({
      data: {
        slug: `cloth${p.photo}`,
        name: p.name,
        model: "身高 30cm / 胸圍 28cm / 腰圍 26cm",
        description:
          "手作娃衣，布料與版型皆為自製。實際顏色可能因螢幕顯示略有差異，尺寸請參考下方娃尺寸表。",
        sizeChart: "S：16CM 娃適用　M：30CM 娃適用　L：40CM 娃適用",
        price: p.price,
        categoryId: categoryIds[p.category],
        featured: Boolean(featured[p.photo]),
        featuredCaption: featured[p.photo] ?? null,
        sortOrder: i + 1,
        images: { create: images },
        variants: { create: sizes },
      },
    });
  }
  console.log(`商品 ${products.length} 筆`);

  // 後台管理員。密碼只存雜湊，登入時比對
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      name: "管理員",
      role: "ADMIN",
    },
  });
  console.log(`管理員帳號：${adminEmail}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
