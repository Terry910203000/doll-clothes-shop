"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { sendOrderEmail } from "@/lib/email";
import {
  PAYMENT_OPTIONS,
  SHIPPING_OPTIONS,
  SOURCE_OPTIONS,
  shippingFee,
} from "@/lib/shipping";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};

  const email = String(form.get("email") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const shipping = String(form.get("shipping") ?? "");
  const payment = String(form.get("payment") ?? "");
  const source = String(form.get("source") ?? "");
  const sourceOther = String(form.get("sourceOther") ?? "").trim();

  if (!email) errors.email = "請填寫 Email";
  else if (!EMAIL_RE.test(email)) errors.email = "Email 格式不正確";

  if (!name) errors.name = "請填寫姓名";

  if (!phone) errors.phone = "請填寫聯絡電話";
  else if (!/^[\d\-+() ]{8,}$/.test(phone)) errors.phone = "電話格式不正確";

  if (!SHIPPING_OPTIONS.some((o) => o.value === shipping)) {
    errors.shipping = "請選擇配送方式";
  }
  if (!PAYMENT_OPTIONS.some((o) => o.value === payment)) {
    errors.payment = "請選擇支付方式";
  }

  // 三項政策都要勾選才能送出
  if (!form.get("terms") || !form.get("privacy") || !form.get("returns")) {
    errors.policies = "請確認並勾選全部三項政策";
  }

  if (source && !SOURCE_OPTIONS.some((o) => o.value === source)) {
    errors.source = "請選擇一個選項";
  }
  if (source === "OTHER" && !sourceOther) {
    errors.source = "選擇「其它」時請填寫說明";
  }

  return {
    errors,
    // 驗證失敗時整包回傳，讓表單重新 render 時能把使用者填過的內容放回去
    // （React 在 Server Action 送出後會重設表單）
    values: {
      email,
      name,
      phone,
      shipping,
      payment,
      source,
      sourceOther,
      terms: Boolean(form.get("terms")),
      privacy: Boolean(form.get("privacy")),
      returns: Boolean(form.get("returns")),
    },
  };
}

/**
 * 送出訂單：驗證表單 → 檢查庫存 → 建立訂單 → 扣庫存 → 清空購物車
 * 整段放在一個交易裡，中途失敗不會留下半筆訂單或扣錯庫存。
 */
export async function createOrder(_prevState, form) {
  const { errors, values } = validate(form);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  const cart = await getCart();
  if (!cart) return { ok: false, errors: { cart: "購物車是空的" }, values };

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      variant: { include: { product: { select: { name: true, price: true } } } },
    },
  });

  if (items.length === 0) {
    return { ok: false, errors: { cart: "購物車是空的" }, values };
  }

  // 下單前再確認一次庫存，避免商品在結帳途中被買走
  const shortage = items.find((i) => i.quantity > i.variant.stock);
  if (shortage) {
    return {
      ok: false,
      errors: {
        cart: `「${shortage.variant.product.name}」${shortage.variant.size} 庫存只剩 ${shortage.variant.stock} 件，請回購物車調整`,
      },
      values,
    };
  }

  const subtotal = items.reduce(
    (sum, i) => sum + i.variant.product.price * i.quantity,
    0,
  );
  const fee = shippingFee(values.shipping);

  const created = await prisma.$transaction(async (tx) => {
    // 編號接在現有訂單之後，補零到 5 位（手稿的 00023 格式）
    const count = await tx.order.count();
    const no = String(count + 1).padStart(5, "0");

    const order = await tx.order.create({
      include: { items: true },
      data: {
        orderNo: no,
        email: values.email,
        name: values.name,
        phone: values.phone,
        shipping: values.shipping,
        payment: values.payment,
        source: values.source || null,
        sourceOther: values.source === "OTHER" ? values.sourceOther : null,
        subtotal,
        shipFee: fee,
        total: subtotal + fee,
        items: {
          create: items.map((i) => ({
            variantId: i.variantId,
            productName: i.variant.product.name,
            size: i.variant.size,
            unitPrice: i.variant.product.price,
            quantity: i.quantity,
          })),
        },
      },
    });

    for (const i of items) {
      await tx.productVariant.update({
        where: { id: i.variantId },
        data: { stock: { decrement: i.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });

  // 寄信失敗不該讓已經成立的訂單看起來像失敗，所以不往上丟
  try {
    await sendOrderEmail({ to: created.email, order: created });
  } catch (e) {
    console.error("[訂單通知信寄送失敗]", e);
  }

  revalidatePath("/cart");
  revalidatePath("/");

  // 貨到付款當場就結束；線上付款要先去綠界
  redirect(
    created.payment === "COD"
      ? `/checkout/done/${created.orderNo}`
      : `/pay/${created.orderNo}`,
  );
}
