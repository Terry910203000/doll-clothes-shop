/**
 * 超商取貨的選項與標籤。
 *
 * 單獨放一個檔案是因為結帳頁的 client component 也要用到，
 * 而 lib/cvs.js 依賴 next/headers，那個只能在伺服器端執行。
 */

/** C2C 是店到店，個人賣家用的就是這種 */
export const CVS_TYPES = [
  { value: "UNIMARTC2C", label: "7-ELEVEN 交貨便" },
  { value: "FAMIC2C", label: "全家店到店" },
  { value: "HILIFEC2C", label: "萊爾富" },
  { value: "OKMARTC2C", label: "OK mart" },
];

export function cvsLabel(subType) {
  return CVS_TYPES.find((t) => t.value === subType)?.label ?? subType ?? "超商";
}

export function isValidCvsType(subType) {
  return CVS_TYPES.some((t) => t.value === subType);
}
