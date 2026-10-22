/**
 * 賣場的對外聯絡資訊。
 *
 * 綠界收款審核要求銷售網頁上必須出現與賣家驗證資料相同的 EMAIL 或電話，
 * 所以這裡的值一定要跟綠界後台「我的設定 > 收款管理」填的完全一樣。
 * email 已是驗證通過的信箱；phone 之後要放的話也必須跟綠界那邊一致。
 */

export const SELLER_CONTACT = {
  name: "Sui 娃娃衣",
  email: "waterswim.doll.studio@gmail.com",
  phone: "",
  // 客服時間寫清楚，審核人員比較好確認是真的在營運
  hours: "週一至週五 10:00–18:00",
  instagram: "",
};

/** 電話去掉空白與括號，給 tel: 連結用 */
export function telHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
