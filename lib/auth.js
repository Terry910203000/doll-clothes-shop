import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 天

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("缺少 AUTH_SECRET，請參考 .env.example 設定 .env");
  }
  return new TextEncoder().encode(value);
}

/**
 * 登入成功後簽發 session。
 *
 * 只把使用者 id 放進去，角色等資料每次都重新從資料庫查，
 * 這樣後台把某人降為一般會員時會立刻生效，不必等 token 過期。
 */
export async function createSession(userId) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true, // 讓 JavaScript 讀不到，降低 XSS 竊取風險
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** 讀出目前登入者，未登入或 token 失效時回傳 null */
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  let userId;
  try {
    const { payload } = await jwtVerify(token, secret());
    userId = payload.sub;
  } catch {
    // 過期或簽章不符
    return null;
  }

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, role: true },
  });
}

/** 後台用：沒登入或不是管理員就回傳 null */
export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}
