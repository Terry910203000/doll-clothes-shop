"use client";

import { useEffect, useRef } from "react";
import { categories } from "@/data/categories";
import { CloseIcon } from "./Icons";
import styles from "./SideMenu.module.css";

/**
 * 左側分類抽屜選單（手繪稿的粉紅色區塊）
 * 第一項 HOME 為標題樣式，其餘為分類連結。
 */
export default function SideMenu({ open, onClose }) {
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

  const [home, ...rest] = categories;

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
          <a href={home.href} className={styles.home} onClick={onClose}>
            {home.label}
          </a>

          <ul className={styles.list}>
            {rest.map((item) => (
              <li key={item.id}>
                <a href={item.href} className={styles.link} onClick={onClose}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
