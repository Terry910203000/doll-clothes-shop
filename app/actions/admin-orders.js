"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const PAYMENT_STATUS = ["UNPAID", "PAID", "REFUNDED"];
const SHIP_STATUS = ["PENDING", "SHIPPED", "RECEIVED"];

/** 後台改訂單的付款／收貨狀態（手稿第 11 頁最後兩欄） */
export async function updateOrderStatus(formData) {
  await requireAdmin("/admin/orders");

  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = String(formData.get("value") ?? "");

  if (field === "paymentStatus" && PAYMENT_STATUS.includes(value)) {
    await prisma.order.update({
      where: { id },
      // 標記為已付款時順便記下時間，銷售統計要用
      data: { paymentStatus: value, paidAt: value === "PAID" ? new Date() : null },
    });
  } else if (field === "shipStatus" && SHIP_STATUS.includes(value)) {
    await prisma.order.update({ where: { id }, data: { shipStatus: value } });
  } else {
    return;
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account");
}
