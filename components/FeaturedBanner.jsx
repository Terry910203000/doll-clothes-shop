"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons";
import styles from "./FeaturedBanner.module.css";

/**
 * 主打商品橫幅（手繪稿中央的區塊）
 * 一次只顯示一張，左右箭頭、下方圓點、手機直接滑動都可以換頁。
 */
export default function FeaturedBanner({ items = [] }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const total = items.length;

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

  // 後台還沒把任何商品設為主打時，整個橫幅就不顯示
  if (total === 0) return null;

  return (
    <section className={styles.banner} aria-label="主打商品" aria-roledescription="輪播">
      <div className={styles.inner}>
        <h2 className={styles.title}>主打商品</h2>

        <div className={styles.carousel}>
          <ul className={styles.track} ref={trackRef}>
            {items.map((item, i) => {
              const cover = item.images?.[0];
              return (
                <li
                  key={item.id}
                  className={styles.slide}
                  aria-roledescription="投影片"
                  aria-label={`${i + 1} / ${total}`}
                >
                  <Link href={`/product/${item.slug}`} className={styles.slideLink}>
                    <div className={styles.slideMedia}>
                      {cover ? (
                        <Image
                          src={cover.url}
                          alt={cover.alt ?? item.name}
                          fill
                          sizes="(max-width: 1180px) 100vw, 1180px"
                          className={styles.slideImage}
                          priority={i === 0}
                        />
                      ) : null}
                    </div>

                    <div className={styles.slideText}>
                      <span className={styles.slideCaption}>{item.featuredCaption}</span>
                      <span className={styles.slideName}>{item.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
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
          {items.map((item, i) => (
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
