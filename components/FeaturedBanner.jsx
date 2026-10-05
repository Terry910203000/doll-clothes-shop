"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { featured } from "@/data/products";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons";
import styles from "./FeaturedBanner.module.css";

// 還沒放照片時，用手繪稿上的圖形當佔位
function Shape({ kind }) {
  return (
    <svg viewBox="0 0 100 100" className={styles.shape} aria-hidden="true">
      {kind === "triangle" && <polygon points="50,14 88,86 12,86" />}
      {kind === "square" && <rect x="16" y="16" width="68" height="68" />}
      {(kind === "circle" || !kind) && <circle cx="50" cy="50" r="34" />}
    </svg>
  );
}

/**
 * 主打商品橫幅（手繪稿中央的區塊）
 * 一次只顯示一張，左右箭頭、下方圓點、手機直接滑動都可以換頁。
 */
export default function FeaturedBanner() {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const total = featured.length;

  // 用手指滑動時同步圓點（按箭頭／圓點的情況由 goTo 直接更新）
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // 算出來跟上次一樣時 setIndex 不會重繪，所以不需要額外節流
    const onScroll = () => {
      const page = Math.round(track.scrollLeft / track.clientWidth);
      setIndex(Math.min(Math.max(page, 0), total - 1));
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [total]);

  const goTo = useCallback(
    (next) => {
      const track = trackRef.current;
      if (!track) return;

      // 最後一張再按下一張就回到第一張
      const page = ((next % total) + total) % total;
      const slide = track.children[page];
      if (!slide) return;

      // 先更新圓點，不必等捲動結束才有回饋
      setIndex(page);

      // 用投影片本身的位置，之後若加了間距或留白也不會算錯
      track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    },
    [total],
  );

  return (
    <section className={styles.banner} aria-label="主打商品" aria-roledescription="輪播">
      <div className={styles.inner}>
        <h2 className={styles.title}>主打商品</h2>

        <div className={styles.carousel}>
          <ul className={styles.track} ref={trackRef}>
            {featured.map((item, i) => (
              <li
                key={item.id}
                className={styles.slide}
                aria-roledescription="投影片"
                aria-label={`${i + 1} / ${total}`}
              >
                <a href={`/product/${item.id}`} className={styles.slideLink}>
                  <div className={styles.slideMedia}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <Shape kind={item.shape} />
                    )}
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
            className={`${styles.navBtn} ${styles.navPrev}`}
            onClick={() => goTo(index - 1)}
            aria-label="上一張"
          >
            <ArrowLeftIcon />
          </button>

          <button
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={() => goTo(index + 1)}
            aria-label="下一張"
          >
            <ArrowRightIcon />
          </button>
        </div>

        <ul className={styles.dots}>
          {featured.map((item, i) => (
            <li key={item.id}>
              <button
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={`第 ${i + 1} 張`}
                aria-current={i === index}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
