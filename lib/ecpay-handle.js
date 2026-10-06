import { prisma } from "./prisma";
import { verifyCallback } from "./ecpay";

/**
 * 處理綠界回傳的付款結果。
 *
 * 伺服器通知（ReturnURL）與瀏覽器帶回（OrderResultURL）會送來同一份資料，
 * 兩邊都呼叫這裡，所以必須可以重複執行而不出錯。
 */
export async function handleEcpayResult(body) {
  // 先驗檢查碼。沒通過就當作偽造，完全不動資料庫。
  if (!verifyCallback(body)) {
    return { ok: false, reason: "檢查碼不符" };
  }

  const orderNo = String(body.CustomField1 ?? "").trim();
  const merchantTradeNo = String(body.MerchantTradeNo ?? "").trim();

  const order = await prisma.order.findFirst({
    where: orderNo ? { orderNo } : { merchantTradeNo },
  });
  if (!order) return { ok: false, reason: "找不到對應訂單" };

  // RtnCode 1 代表付款成功，其餘都是失敗或尚未完成
  const paid = String(body.RtnCode) === "1";

  if (paid && order.paymentStatus !== "PAID") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
        ecpayTradeNo: String(body.TradeNo ?? "") || null,
      },
    });
  }

  return { ok: true, paid, orderNo: order.orderNo };
}

/** 綠界送來的是 form-urlencoded，轉成單純的物件 */
export async function readEcpayBody(request) {
  const form = await request.formData();
  return Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
}
