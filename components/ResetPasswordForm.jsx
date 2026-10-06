"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import styles from "./auth.module.css";

export default function ResetPasswordForm({ token }) {
  const [state, action, pending] = useActionState(resetPassword, null);
  const errors = state?.errors ?? {};

  return (
    <form action={action} className={styles.form} noValidate>
      <input type="hidden" name="token" value={token} />

      {errors.token ? (
        <>
          <p className={styles.errorBox}>{errors.token}</p>
          <div className={styles.links}>
            <Link href="/forgot">重新申請</Link>
          </div>
        </>
      ) : null}

      <div className={styles.field}>
        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="請輸入新密碼（至少 8 個字）"
          autoComplete="new-password"
          aria-label="新密碼"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className={styles.error}>{errors.password}</p> : null}
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          name="confirm"
          type="password"
          placeholder="確認新密碼"
          autoComplete="new-password"
          aria-label="確認新密碼"
          aria-invalid={Boolean(errors.confirm)}
        />
        {errors.confirm ? <p className={styles.error}>{errors.confirm}</p> : null}
      </div>

      <button
        type="submit"
        className={`${styles.submit} ${styles.submitPink}`}
        disabled={pending}
      >
        {pending ? "處理中…" : "重設密碼"}
      </button>
    </form>
  );
}
