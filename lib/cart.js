import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";

const COOKIE = "cart_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 天

/**
 * 取得目前這位訪客／會員的購物車，必要時建立。
 *
 * 已登入 → 掛在會員底下，換裝置也看得到。
 * 未登入 → 用 cookie 裡的隨機 sessionId 辨識，登入時再由 mergeGuestCart 併過去。
 *
 * @param {boolean} create false 時只查詢不建立。
 *   Server Component 不能寫 cookie，所以只有 Server Action 會傳 true。
 */
export async function getCart({ create = false } = {}) {
  const user = await getCurrentUser();

  if (user) {
    const existing = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (existing) return existing;
    if (!create) return null;
    return prisma.cart.create({ data: { userId: user.id } });
  }

  const jar = await cookies();
  const sessionId = jar.get(COOKIE)?.value;

  if (sessionId) {
    const existing = await prisma.cart.findUnique({ where: { sessionId } });
    if (existing) return existing;
  }

  if (!create) return null;

  const newId = randomUUID();
  const cart = await prisma.cart.create({ data: { sessionId: newId } });
  jar.set(COOKIE, newId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
  return cart;
}

/**
 * 登入／註冊後，把未登入時加的商品併進會員的購物車。
 * 兩邊都有同一個尺寸時數量相加，並以庫存為上限。
 */
export async function mergeGuestCart(userId) {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE)?.value;
  if (!sessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { variant: { select: { stock: true } } } } },
  });
  if (!guestCart) return;

  if (guestCart.items.length > 0) {
    const userCart =
      (await prisma.cart.findUnique({ where: { userId } })) ??
      (await prisma.cart.create({ data: { userId } }));

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findUnique({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
      });

      const quantity = Math.min(
        (existing?.quantity ?? 0) + item.quantity,
        item.variant.stock,
      );

      await prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
        update: { quantity },
        create: { cartId: userCart.id, variantId: item.variantId, quantity },
      });
    }
  }

  // 訪客購物車併完就沒用了，連同 cookie 一起清掉
  await prisma.cart.delete({ where: { id: guestCart.id } });
  jar.delete(COOKIE);
}

/** 購物車內容，含商品與照片 */
export async function getCartWithItems() {
  const cart = await getCart();
  if (!cart) return { items: [], subtotal: 0, count: 0 };

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    orderBy: { createdAt: "asc" },
    include: {
      variant: {
        include: {
          product: {
            select: {
              slug: true,
              name: true,
              price: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.product.price * item.quantity,
    0,
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, count };
}
