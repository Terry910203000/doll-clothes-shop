"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";

/**
 * 加入購物車。已經有同一尺寸就累加數量，並以庫存為上限。
 */
export async function addToCart({ variantId, quantity = 1 }) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, stock: true },
  });
  if (!variant) return { ok: false, message: "找不到這個尺寸" };
  if (variant.stock <= 0) return { ok: false, message: "這個尺寸已經賣完了" };

  const cart = await getCart({ create: true });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  const nextQty = Math.min((existing?.quantity ?? 0) + qty, variant.stock);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: nextQty },
    create: { cartId: cart.id, variantId, quantity: nextQty },
  });

  revalidatePath("/cart");

  const capped = nextQty < (existing?.quantity ?? 0) + qty;
  return {
    ok: true,
    message: capped ? `庫存只剩 ${variant.stock} 件，已調整數量` : "已加入購物車",
  };
}

/** 購物車頁的數量調整。數量歸零等同移除 */
export async function updateCartItem({ itemId, quantity }) {
  const qty = Math.floor(Number(quantity) || 0);
  const cart = await getCart();
  if (!cart) return { ok: false, message: "購物車是空的" };

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { variant: { select: { stock: true } } },
  });
  if (!item) return { ok: false, message: "找不到這筆商品" };

  if (qty <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: Math.min(qty, item.variant.stock) },
    });
  }

  revalidatePath("/cart");
  return { ok: true };
}

/** 購物車頁的垃圾桶按鈕 */
export async function removeCartItem({ itemId }) {
  const cart = await getCart();
  if (!cart) return { ok: false };

  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });

  revalidatePath("/cart");
  return { ok: true };
}
