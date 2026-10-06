/**
 * 配送與付款選項。
 * TODO: 運費金額先暫定，實際費率確定後改這裡即可。
 */

export const SHIPPING_OPTIONS = [
  { value: "HOME_DELIVERY", label: "一般宅配", fee: 120 },
  { value: "CVS_PICKUP", label: "超商取貨", fee: 60 },
];

export const PAYMENT_OPTIONS = [
  { value: "COD", label: "貨到付款" },
  { value: "LINE_PAY", label: "LINE PAY" },
  { value: "CREDIT_CARD", label: "信用卡付款" },
];

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
