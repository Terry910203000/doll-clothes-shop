"use client";

import { useEffect, useRef } from "react";
import styles from "./EcpayRedirect.module.css";

/**
 * 轉送到綠界付款頁。
 *
 * 綠界只接受 POST，所以組一個隱藏表單自動送出。
 * 若瀏覽器擋下自動送出，下方按鈕可以手動點。
 */
export default function EcpayRedirect({ form, orderNo }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.submit();
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>正在前往付款頁⋯</h1>
      <p className={styles.note}>訂單編號 {orderNo}</p>

      {!form.live ? (
        <p className={styles.testBox}>
          目前使用綠界<strong>測試環境</strong>，不會真的扣款。
          <br />
          測試卡號 <code>4311-9522-2222-2222</code>，
          有效期限填任何未來日期，安全碼任意三碼。
        </p>
      ) : null}

      <form ref={ref} action={form.action} method="POST">
        {Object.entries(form.fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button type="submit" className={styles.button}>
          沒有自動跳轉？點這裡前往付款
        </button>
      </form>
    </div>
  );
}
