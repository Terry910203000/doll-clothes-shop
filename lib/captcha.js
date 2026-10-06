import { cookies } from "next/headers";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const COOKIE = "captcha";
const MAX_AGE = 60 * 10; // 10 分鐘

/**
 * 圖形認證碼（手稿第 7 頁）。
 *
 * 答案不直接放進 cookie，而是存 HMAC 雜湊，
 * 這樣即使使用者看得到 cookie 內容也推不出答案。
 */
function sign(code) {
  const key = process.env.AUTH_SECRET;
  if (!key) throw new Error("缺少 AUTH_SECRET，請參考 .env.example 設定 .env");
  return createHmac("sha256", key).update(code.toLowerCase()).digest("hex");
}

// 去掉 0/O/1/I/l 這類看起來一樣的字元，避免使用者輸錯
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export async function issueCaptcha() {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }

  const jar = await cookies();
  jar.set(COOKIE, sign(code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });

  return code;
}

/** 驗證後立即作廢，避免同一組代碼被重複使用 */
export async function verifyCaptcha(input) {
  const jar = await cookies();
  const expected = jar.get(COOKIE)?.value;
  if (!expected || !input) return false;

  const actual = sign(String(input).trim());
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  const ok = timingSafeEqual(a, b);
  if (ok) jar.delete(COOKIE);
  return ok;
}

/** 把代碼畫成 SVG，加上傾斜與干擾線讓程式不易直接辨識 */
export function captchaSvg(code) {
  const w = 108;
  const h = 40;

  const chars = [...code]
    .map((ch, i) => {
      const x = 14 + i * 24;
      const y = 28 + (i % 2 === 0 ? -2 : 2);
      const rotate = -18 + ((i * 37) % 36);
      return `<text x="${x}" y="${y}" font-family="monospace" font-size="24" font-weight="700" fill="#c0392b" transform="rotate(${rotate} ${x} ${y})">${ch}</text>`;
    })
    .join("");

  const lines = [0, 1, 2]
    .map((i) => {
      const y1 = 8 + i * 11;
      const y2 = 32 - i * 9;
      return `<path d="M0 ${y1} Q ${w / 2} ${y2} ${w} ${y1}" stroke="rgba(147,90,36,0.45)" stroke-width="1.4" fill="none"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="圖形認證碼"><rect width="${w}" height="${h}" fill="#fff"/>${lines}${chars}</svg>`;
}
