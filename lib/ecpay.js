import { createHash } from "node:crypto";

/**
 * 綠界 ECPay 全方位金流（AIO）
 *
 * 沒設定 ECPAY_* 時自動使用綠界官方公開的「測試商店」代號，
 * 所以還沒申請特約商店也能把整段流程跑完。
 * 測試環境不會真的扣款，刷卡請用綠界文件上的測試卡號。
 */

// 綠界官方文件公開的測試商店資料
const TEST = {
  merchantId: "2000132",
  hashKey: "5294y06JbISpM5x9",
  hashIV: "v77hoKGq4kWxNNIS",
};

const ENDPOINT = {
  test: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",
  live: "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5",
};

export function ecpayConfig() {
  const { ECPAY_MERCHANT_ID, ECPAY_HASH_KEY, ECPAY_HASH_IV } = process.env;
  const live = Boolean(ECPAY_MERCHANT_ID && ECPAY_HASH_KEY && ECPAY_HASH_IV);

  return {
    live,
    merchantId: live ? ECPAY_MERCHANT_ID : TEST.merchantId,
    hashKey: live ? ECPAY_HASH_KEY : TEST.hashKey,
    hashIV: live ? ECPAY_HASH_IV : TEST.hashIV,
    endpoint: live ? ENDPOINT.live : ENDPOINT.test,
  };
}

/**
 * 綠界規定要照 .NET 的 HttpUtility.UrlEncode 來編碼。
 *
 * .NET 不轉義的字元是 A-Z a-z 0-9 與 -_.!*()，空白轉成 +。
 * JavaScript 的 encodeURIComponent 規則幾乎相同，只差在
 * 它多放過了 ' 和 ~ 這兩個字元，所以要自己補上。
 * 只要有一個字元沒對上，檢查碼就會不符而被綠界退件。
 */
function dotNetUrlEncode(value) {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/'/g, "%27")
    .replace(/~/g, "%7E")
    .toLowerCase();
}

/**
 * 產生檢查碼 CheckMacValue。
 * 綠界用它確認參數在傳輸途中沒有被竄改，
 * 回傳的通知也要用同一套規則驗證才能相信。
 */
export function checkMacValue(params, { hashKey, hashIV }) {
  const sorted = Object.keys(params)
    .filter((k) => k !== "CheckMacValue" && params[k] !== undefined && params[k] !== null)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`;

  return createHash("sha256").update(dotNetUrlEncode(raw)).digest("hex").toUpperCase();
}

/** 驗證綠界回傳的通知是否可信 */
export function verifyCallback(body) {
  const cfg = ecpayConfig();
  const received = String(body.CheckMacValue ?? "");
  if (!received) return false;

  return checkMacValue(body, cfg) === received.toUpperCase();
}

const PAYMENT_TYPE = {
  CREDIT_CARD: "Credit",
  LINE_PAY: "Credit", // 綠界的 LINE Pay 需另外開通，未開通前走信用卡
};

/**
 * 組出要 POST 給綠界的表單欄位。
 *
 * @param order      訂單（需含 orderNo、total、items）
 * @param returnUrl  綠界伺服器對伺服器的付款通知網址（正式的入帳依據）
 * @param resultUrl  付款後由瀏覽器 POST 回來的網址，用來立刻給使用者結果
 * @param clientUrl  使用者按「返回商店」時導回的網址
 */
export function buildPaymentForm({ order, returnUrl, resultUrl, clientUrl }) {
  const cfg = ecpayConfig();

  // 綠界的商品名稱欄位有長度限制，且不接受部分符號
  const itemName =
    order.items
      .map((i) => `${i.productName.replace(/[#&=]/g, " ")} x${i.quantity}`)
      .join("#")
      .slice(0, 190) || "商品";

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  const params = {
    MerchantID: cfg.merchantId,
    // 綠界規定英數字、最長 20 碼，且同一商店不可重複
    MerchantTradeNo: `${order.orderNo}${now.getTime().toString().slice(-8)}`.slice(0, 20),
    MerchantTradeDate: `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    PaymentType: "aio",
    TotalAmount: String(order.total),
    TradeDesc: "娃娃衣訂單",
    ItemName: itemName,
    // ReturnURL 是綠界主機直接打我們的伺服器，正式入帳以它為準；
    // 但本機開發時綠界連不到 localhost，所以另外用 OrderResultURL
    // 讓瀏覽器把結果帶回來，使用者才不會停在空白頁。
    ReturnURL: returnUrl,
    OrderResultURL: resultUrl,
    ClientBackURL: clientUrl,
    ChoosePayment: PAYMENT_TYPE[order.payment] ?? "ALL",
    EncryptType: "1",
    // 讓綠界把我們的訂單編號原樣帶回，才知道這筆付款對應哪張單
    CustomField1: order.orderNo,
  };

  return {
    action: cfg.endpoint,
    live: cfg.live,
    fields: { ...params, CheckMacValue: checkMacValue(params, cfg) },
  };
}
