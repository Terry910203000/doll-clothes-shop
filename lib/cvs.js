import { cookies } from "next/headers";
import { isValidCvsType } from "./cvs-types";

export { CVS_TYPES, cvsLabel, isValidCvsType } from "./cvs-types";

/**
 * 綠界超商取貨：門市電子地圖。
 *
 * 流程是消費者在我們的結帳頁按「選擇門市」→ 瀏覽器 POST 到綠界的地圖頁
 * → 選完門市後綠界把門市資料 POST 回我們的 ServerReplyURL
 * → 我們存進 cookie 再把人導回結帳頁。
 *
 * 地圖頁不需要檢查碼，所以這裡只組表單。
 */

const COOKIE = "cvs_store";
const MAX_AGE = 60 * 60 * 2; // 2 小時，夠完成一次結帳

const MAP_ENDPOINT = {
  test: "https://logistics-stage.ecpay.com.tw/Express/map",
  live: "https://logistics.ecpay.com.tw/Express/map",
};

// 綠界物流的測試商店代號，跟金流那組不一樣。
// 而且 B2C（超商大宗）與 C2C（店到店）各有各的測試帳號，
// 我們用的 UNIMARTC2C 這類屬於 C2C。
const TEST_MERCHANT_ID = "2000933";

function logisticsConfig() {
  // 物流在綠界是另外開通的服務，商店代號可能與金流不同，
  // 所以獨立一個環境變數；沒設定就沿用金流那組。
  const id = process.env.ECPAY_LOGISTICS_MERCHANT_ID || process.env.ECPAY_MERCHANT_ID;
  const live = Boolean(id);
  return {
    live,
    merchantId: live ? id : TEST_MERCHANT_ID,
    endpoint: live ? MAP_ENDPOINT.live : MAP_ENDPOINT.test,
  };
}

/** 組出要 POST 給綠界地圖頁的欄位 */
export function buildMapForm({ subType, replyUrl }) {
  const cfg = logisticsConfig();

  return {
    action: cfg.endpoint,
    live: cfg.live,
    fields: {
      MerchantID: cfg.merchantId,
      LogisticsType: "CVS",
      LogisticsSubType: subType,
      IsCollection: "N", // 代收貨款另外申請，這裡先不開
      ServerReplyURL: replyUrl,
      Device: "0", // 0 桌機 / 1 行動裝置
      ExtraData: subType, // 原樣帶回，用來知道選的是哪一家超商
    },
  };
}

/** 把選好的門市記在 cookie，結帳頁要讀它 */
export async function saveSelectedStore(store) {
  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify(store), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getSelectedStore() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;

  try {
    const store = JSON.parse(raw);
    return store?.storeId ? store : null;
  } catch {
    // cookie 被改壞就當作沒選
    return null;
  }
}

export async function clearSelectedStore() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
