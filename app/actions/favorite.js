"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/** 收藏／取消收藏。未登入時回報需要登入，由前端導向登入頁 */
export async function toggleFavorite({ productId }) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, needLogin: true };

  const key = { userId_productId: { userId: user.id, productId } };
  const existing = await prisma.favorite.findUnique({ where: key });

  if (existing) {
    await prisma.favorite.delete({ where: key });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, productId } });
  }

  revalidatePath("/account");
  return { ok: true, favorited: !existing };
}

/** 商品頁載入時用來決定愛心要不要填滿 */
export async function isFavorited(productId) {
  const user = await getCurrentUser();
  if (!user) return false;

  const row = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  return Boolean(row);
}
