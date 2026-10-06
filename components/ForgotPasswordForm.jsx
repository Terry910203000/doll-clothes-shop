"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import Captcha from "./Captcha";
import styles from "./auth.module.css";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);
  const errors = state?.errors ?? {};

  if (state?.sent) {
    return (
      <div className={styles.form}>
        <p className={styles.okBox}>
          如果這個電子郵箱已經註冊過，重設密碼的連結已經寄出，請到信箱查收。
          連結 30 分鐘內有效。
        </p>
        <div className={styles.links}>
          <Link href="/login">回登入</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className={styles.form} noValidate>
      <div className={styles.field}>
        <input
          className={styles.input}
          name="email"
          type="email"
          placeholder="請輸入電子郵箱"
          autoComplete="email"
          defaultValue={state?.values?.email}
          aria-label="電子郵箱"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className={styles.error}>{errors.email}</p> : null}
      </div>

      <Captcha error={errors.captcha} />

      <button
        type="submit"
        className={`${styles.submit} ${styles.submitPink}`}
        disabled={pending}
      >
        {pending ? "送出中…" : "送出"}
      </button>

      <div className={styles.links}>
        <Link href="/login">回登入</Link>
        <Link href="/register">註冊帳號</Link>
      </div>
    </form>
  );
}
