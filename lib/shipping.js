/**
 * 配送與付款選項。
 * TODO: 運費金額先暫定，實際費率確定後改這裡即可。
 */

export const SHIPPING_OPTIONS = [
  { value: "HOME_DELIVERY", label: "一般宅配", fee: 120 },
  { value: "CVS_PICKUP", label: "超商取貨", fee: 60 },
];

export const PAYMENT_OPTIONS = [
  { value: "COD", label: "貨到付款", online: false },
  { value: "LINE_PAY", label: "LINE PAY", online: true },
  { value: "CREDIT_CARD", label: "信用卡付款", online: true },
];

/**
 * 可以給客人選的付款方式。
 *
 * 還沒申請到綠界特約商店時，線上付款走的是測試環境：
 * 客人會看到「付款完成」，但錢根本沒進來。
 * 所以金鑰填好之前只開放貨到付款。
 */
export function availablePayments(ecpayLive) {
  return ecpayLive ? PAYMENT_OPTIONS : PAYMENT_OPTIONS.filter((o) => !o.online);
}

export const SOURCE_OPTIONS = [
  { value: "THREADS", label: "Threads" },
  { value: "IG", label: "IG" },
  { value: "OTHER", label: "其它" },
];

export const POLICIES = [
  { id: "terms", label: "服務條款" },
  { id: "privacy", label: "隱私政策" },
  { id: "returns", label: "退換貨政策" },
];

export function shippingFee(method) {
  return SHIPPING_OPTIONS.find((o) => o.value === method)?.fee ?? 0;
}

export function shippingLabel(method) {
  return SHIPPING_OPTIONS.find((o) => o.value === method)?.label ?? method;
}

export function paymentLabel(method) {
  return PAYMENT_OPTIONS.find((o) => o.value === method)?.label ?? method;
}
