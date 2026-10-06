"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CVS_TYPES } from "@/lib/cvs-types";
import styles from "./CvsPicker.module.css";

/**
 * 超商門市選擇（結帳頁，選了「超商取貨」才會出現）
 *
 * 綠界的地圖頁只吃 POST，所以動態組一張表單送出。
 * 刻意開在新視窗：如果直接跳轉，使用者在結帳頁填好的資料會全部不見。
 * 另外也不能把表單寫在 JSX 裡——它會落在結帳表單內部，
 * 而 HTML 不允許巢狀表單，瀏覽器會把它拆掉。
 */
export default function CvsPicker({ store, error }) {
  const [subType, setSubType] = useState(store?.subType ?? CVS_TYPES[0].value);
  const router = useRouter();

  // 子視窗選完門市後會通知我們，收到就重新讀取頁面拿到門市資料
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data === "cvs-store-selected") router.refresh();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  const openMap = () => {
    const win = window.open("", "ecpayCvsMap", "width=960,height=720");

    const form = document.createElement("form");
    form.action = "/api/ecpay/cvs-map";
    form.method = "POST";
    // 開不了新視窗（被擋）時退回同一個視窗，至少功能還在
    form.target = win ? "ecpayCvsMap" : "_self";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "subType";
    input.value = subType;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    form.remove();
  };

  return (
    <div className={styles.wrap}>
      {store ? (
        <div className={styles.chosen}>
          <span className={styles.chosenLabel}>已選門市</span>
          <strong className={styles.chosenName}>{store.storeName}</strong>
          <span className={styles.chosenMeta}>
            店號 {store.storeId}
            {store.address ? `　${store.address}` : ""}
          </span>
        </div>
      ) : (
        <p className={styles.hint}>請先選擇取貨門市，才能完成結帳。</p>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.form}>
        <select
          value={subType}
          onChange={(e) => setSubType(e.target.value)}
          className={styles.select}
          aria-label="選擇超商"
        >
          {CVS_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <button type="button" className={styles.button} onClick={openMap}>
          {store ? "重新選擇門市" : "選擇門市"}
        </button>
      </div>
    </div>
  );
}
