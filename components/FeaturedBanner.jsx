"use client";

import { useRef } from "react";
import { featured } from "@/data/products";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons";
import styles from "./FeaturedBanner.module.css";

// 手繪稿上「主打商品」旁的三個圖形，當作尚未放圖時的佔位
const shapes = ["triangle", "square", "circle"];

function Shape({ kind }) {
  if (kind === "triangle") {
    return (
      <svg viewBox="0 0 100 100" className={styles.shape} aria-hidden="true">
        <polygon points="50,14 88,86 12,86" />
      </svg>
    );
  }
  if (kind === "square") {
    return (
      <svg viewBox="0 0 100 100" className={styles.shape} aria-hidden="true">
        <rect x="16" y="16" width="68" height="68" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className={styles.shape} aria-hidden="true">
      <circle cx="50" cy="50" r="34" />
    </svg>
  );
}

/**
 * 主打商品橫幅（手繪稿中央的區塊）
 * 底色 rgb(147,102,35)，左側標題，右側可左右捲動的主打商品。
 */
export default function FeaturedBanner() {
  const trackRef = useRef(null);

  const scrollBy = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const step = track.clientWidth * 0.7;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className={styles.banner} aria-label="主打商品">
      <div className={styles.inner}>
        <h2 className={styles.title}>主打商品</h2>

        <div className={styles.carousel}>
          <button
            className={`${styles.navBtn} ${styles.navPrev}`}
            onClick={() => scrollBy(-1)}
            aria-label="上一個主打商品"
          >
            <ArrowLeftIcon />
          </button>

          <ul className={styles.track} ref={trackRef}>
            {featured.map((item, i) => (
              <li key={item.id} className={styles.slide}>
                <a href={`/product/${item.id}`} className={styles.slideLink}>
                  <div className={styles.slideMedia}>
                    <Shape kind={shapes[i % shapes.length]} />
                  </div>
                  <div className={styles.slideText}>
                    <span className={styles.slideCaption}>{item.caption}</span>
                    <span className={styles.slideName}>{item.name}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          <button
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={() => scrollBy(1)}
            aria-label="下一個主打商品"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
