"use client";

import { useState } from "react";
import { RefreshIcon } from "./Icons";
import styles from "./auth.module.css";

/**
 * 圖形認證碼欄位（手稿第 7 頁）
 *
 * 圖片由 /api/captcha 產生，答案只以雜湊存在 httpOnly cookie，
 * 不會送到瀏覽器。換一張就換個查詢字串重新取圖。
 */
export default function Captcha({ error }) {
  const [nonce, setNonce] = useState(0);

  return (
    <div className={styles.field}>
      <div className={styles.captchaRow}>
        <input
          className={styles.input}
          name="captcha"
          type="text"
          placeholder="請輸入認證碼"
          autoComplete="off"
          maxLength={8}
          aria-invalid={Boolean(error)}
        />

        <div className={styles.captchaBox}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.captchaImage}
            src={nonce === 0 ? "/api/captcha" : `/api/captcha?r=${nonce}`}
            alt="圖形認證碼"
            width={108}
            height={34}
          />

          <button
            type="button"
            className={styles.captchaRefresh}
            onClick={() => setNonce(Date.now())}
            aria-label="換一張認證碼"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
