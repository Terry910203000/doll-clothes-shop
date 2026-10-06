"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import { mergeGuestCart } from "@/lib/cart";
import { verifyCaptcha } from "@/lib/captcha";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/**
 * 會員登入。
 *
 * 帳號或密碼錯誤一律回同一句話，不說是哪一邊錯，
 * 否則等於讓人用錯誤訊息逐一試出哪些 Email 有註冊過。
 */
export async function login(_prevState, form) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");

  if (!email || !password) {
    return { ok: false, error: "請輸入帳號與密碼", values: { email } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const matched = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !matched) {
    return { ok: false, error: "帳號或密碼不正確", values: { email } };
  }

  await createSession(user.id);
  await mergeGuestCart(user.id);

  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/");
}

/** 會員註冊 */
export async function register(_prevState, form) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const captcha = String(form.get("captcha") ?? "");

  const errors = {};

  if (!email) errors.email = "請輸入電子郵箱";
  else if (!EMAIL_RE.test(email)) errors.email = "電子郵箱格式不正確";

  if (!password) errors.password = "請輸入密碼";
  else if (password.length < MIN_PASSWORD) {
    errors.password = `密碼至少 ${MIN_PASSWORD} 個字`;
  }

  if (password !== confirm) errors.confirm = "兩次輸入的密碼不一致";

  if (!(await verifyCaptcha(captcha))) errors.captcha = "認證碼不正確";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values: { email } };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      errors: { email: "這個電子郵箱已經註冊過了" },
      values: { email },
    };
  }

  const user = await prisma.user.create({
    data: { email, password: await bcrypt.hash(password, 10) },
  });

  await createSession(user.id);
  await mergeGuestCart(user.id);

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function logout() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * 忘記密碼：寄送重設連結。
 *
 * 不論這個 Email 有沒有註冊過都回報成功，避免被用來試探帳號是否存在。
 */
export async function requestPasswordReset(_prevState, form) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const captcha = String(form.get("captcha") ?? "");

  const errors = {};
  if (!email) errors.email = "請輸入電子郵箱";
  else if (!EMAIL_RE.test(email)) errors.email = "電子郵箱格式不正確";
  if (!(await verifyCaptcha(captcha))) errors.captcha = "認證碼不正確";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values: { email } };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // 原始代碼只出現在信件連結裡，資料庫只留雜湊
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 分鐘
      },
    });

    // TODO: 接上寄信服務後改成真的寄出。
    // 目前先印在伺服器終端機，方便開發時測試整個流程。
    console.log(`[重設密碼] ${email} → /reset/${token}`);
  }

  return { ok: true, sent: true };
}

/** 用信件裡的連結重設密碼 */
export async function resetPassword(_prevState, form) {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  const errors = {};
  if (!password) errors.password = "請輸入新密碼";
  else if (password.length < MIN_PASSWORD) {
    errors.password = `密碼至少 ${MIN_PASSWORD} 個字`;
  }
  if (password !== confirm) errors.confirm = "兩次輸入的密碼不一致";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { ok: false, errors: { token: "這個重設連結已失效，請重新申請" } };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { password: await bcrypt.hash(password, 10) },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    // 同一個帳號其他尚未使用的連結一併作廢
    prisma.passwordResetToken.deleteMany({
      where: { userId: row.userId, usedAt: null, NOT: { id: row.id } },
    }),
  ]);

  redirect("/login?reset=1");
}

/** 會員資料頁的基本資料修改 */
export async function updateProfile(_prevState, form) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();

  if (phone && !/^[\d\-+() ]{8,}$/.test(phone)) {
    return { ok: false, errors: { phone: "電話格式不正確" } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: name || null, phone: phone || null },
  });

  revalidatePath("/account");
  return { ok: true, message: "已儲存" };
}
