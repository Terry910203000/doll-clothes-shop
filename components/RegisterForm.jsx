"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import Captcha from "./Captcha";
import styles from "./auth.module.css";

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, null);
  const errors = state?.errors ?? {};

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

      <div className={styles.field}>
        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="請輸入密碼（至少 8 個字）"
          autoComplete="new-password"
          aria-label="密碼"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className={styles.error}>{errors.password}</p> : null}
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          name="confirm"
          type="password"
          placeholder="確認密碼"
          autoComplete="new-password"
          aria-label="確認密碼"
          aria-invalid={Boolean(errors.confirm)}
        />
        {errors.confirm ? <p className={styles.error}>{errors.confirm}</p> : null}
      </div>

      <Captcha error={errors.captcha} />

      <button
        type="submit"
        className={`${styles.submit} ${styles.submitPink}`}
        disabled={pending}
      >
        {pending ? "註冊中…" : "註冊"}
      </button>

      <p className={styles.note}>當你註冊會員即代表同意服務條款</p>

      <div className={styles.links}>
        <Link href="/login">登入</Link>
        <Link href="/forgot">忘記密碼？</Link>
      </div>
    </form>
  );
}
