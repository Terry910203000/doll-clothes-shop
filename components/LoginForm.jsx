"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import styles from "./auth.module.css";

export default function LoginForm({ next = "/", justReset = false }) {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className={styles.form} noValidate>
      <input type="hidden" name="next" value={next} />

      {justReset ? (
        <p className={styles.okBox}>密碼已重設，請用新密碼登入。</p>
      ) : null}

      {state?.error ? <p className={styles.errorBox}>{state.error}</p> : null}

      <div className={styles.field}>
        <input
          className={styles.input}
          name="email"
          type="text"
          placeholder="請輸入帳號或電子郵箱"
          autoComplete="username"
          defaultValue={state?.values?.email}
          aria-label="帳號或電子郵箱"
        />
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="請輸入密碼"
          autoComplete="current-password"
          aria-label="密碼"
        />
      </div>

      <button
        type="submit"
        className={`${styles.submit} ${styles.submitDark}`}
        disabled={pending}
      >
        {pending ? "登入中…" : "會員登入"}
      </button>

      <div className={styles.links}>
        <Link href="/register">註冊帳號</Link>
        <Link href="/forgot">忘記密碼？</Link>
      </div>
    </form>
  );
}
