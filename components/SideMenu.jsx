"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CloseIcon } from "./Icons";
import styles from "./SideMenu.module.css";

/**
 * 左側分類抽屜選單（手繪稿的粉紅色區塊）
 * HOME 固定在最上方，其餘分類由資料庫帶入。
 */
export default function SideMenu({ open, onClose, categories = [] }) {
  const panelRef = useRef(null);

  // 開啟時鎖住背景捲動，並支援 Esc 關閉
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-label="商品分類選單"
        aria-hidden={!open}
        inert={!open}
      >
        <div className={styles.panelTop}>
          <button className={styles.close} onClick={onClose} aria-label="關閉選單">
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.nav}>
          <Link href="/" className={styles.home} onClick={onClose}>
            HOME
          </Link>

          <ul className={styles.list}>
            {categories.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/category/${item.slug}`}
                  className={styles.link}
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
