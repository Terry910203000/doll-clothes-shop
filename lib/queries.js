import { prisma } from "./prisma";

/** 側邊選單用的分類，HOME 由畫面自己加在最前面 */
export function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true },
  });
}

/** 首頁主打商品輪播 */
export function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true, // 主打商品改成卡片樣式後也要顯示價格
      featuredCaption: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
    },
  });
}

/** 商品列表。不給 categorySlug 就是全部商品 */
export function getProducts({ categorySlug } = {}) {
  return prisma.product.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : undefined,
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
      variants: { select: { size: true } },
    },
  });
}

/** 商品詳情頁。查無資料時回傳 null，由頁面決定顯示 404 */
export function getProductBySlug(slug) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/** 商品詳情頁下方的「其它搭配」：同分類的其他商品 */
export function getRelatedProducts({ categorySlug, excludeSlug, take = 4 }) {
  return prisma.product.findMany({
    where: {
      category: { slug: categorySlug },
      slug: { not: excludeSlug },
    },
    orderBy: { sortOrder: "asc" },
    take,
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
    },
  });
}
