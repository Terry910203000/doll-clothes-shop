"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ProductGallery.module.css";

/**
 * 商品相簿：上方大圖，下方縮圖 1 / 2 / 3（手稿第 3 頁左側）
 */
export default function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className={`${styles.main} ${styles.empty}`}>照片準備中</div>;
  }

  const current = images[active];

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <Image
          src={current.url}
          alt={current.alt ?? name}
          fill
          sizes="(max-width: 900px) 100vw, 520px"
          className={styles.image}
          priority
        />
      </div>

      {images.length > 1 && (
        <ul className={styles.thumbs}>
          {images.map((img, i) => (
            <li key={img.id ?? img.url}>
              <button
                type="button"
                className={`${styles.thumb} ${i === active ? styles.thumbActive : ""}`}
                onClick={() => setActive(i)}
                aria-label={`檢視第 ${i + 1} 張照片`}
                aria-current={i === active}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="90px"
                  className={styles.image}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
