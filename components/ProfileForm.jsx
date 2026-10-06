"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/auth";
import styles from "./ProfileForm.module.css";

/** 會員資料頁的個人資料（手稿第 6 頁上半） */
export default function ProfileForm({ user }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  const errors = state?.errors ?? {};

  return (
    <form action={action} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="profile-name">姓名</label>
        <input
          id="profile-name"
          name="name"
          type="text"
          defaultValue={user.name ?? ""}
          autoComplete="name"
          placeholder="尚未填寫"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="profile-email">Email</label>
        {/* Email 是登入帳號，要改動牽涉重新驗證，這一版先不開放 */}
        <input id="profile-email" type="email" value={user.email} disabled />
      </div>

      <div className={styles.field}>
        <label htmlFor="profile-phone">電話</label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
          autoComplete="tel"
          placeholder="尚未填寫"
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone ? <p className={styles.error}>{errors.phone}</p> : null}
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.save} disabled={pending}>
          {pending ? "儲存中…" : "儲存"}
        </button>
        {state?.ok ? <span className={styles.saved}>{state.message}</span> : null}
      </div>
    </form>
  );
}
