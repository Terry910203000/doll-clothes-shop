import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";

const COOKIE = "cart_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 天

/**
 * 取得目前這位訪客的購物車，必要時建立。
 * 未登入用 cookie 裡的隨機 sessionId 辨識；登入後改掛在會員底下。
 *
 * @param {boolean} create false 時只查詢，不會寫 cookie（給 Server Component 用）
 */
export async function getCart({ create = false } = {}) {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE)?.value;

  if (sessionId) {
    const existing = await prisma.cart.findUnique({ where: { sessionId } });
    if (existing) return existing;
  }

  if (!create) return null;

  // Server Component 不能寫 cookie，這裡只會在 Server Action 裡被呼叫到
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

/** 購物車內容，含商品與照片，供購物車頁與頂部數量標示使用 */
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
