"use client";

import { useEffect, useRef } from "react";
import { memberMenu } from "@/data/memberMenu";
import { HeartIcon, ReceiptIcon, UserIcon, ChevronRightIcon } from "./Icons";
import styles from "./MemberMenu.module.css";

const iconMap = {
  heart: HeartIcon,
  user: UserIcon,
  receipt: ReceiptIcon,
};

/**
 * 會員下拉選單（手繪稿的淺藍色區塊）
 * 由頂部列的人物圖示觸發，收藏清單 / 個人資料 / 購買記錄。
 */
export default function MemberMenu({ open, onClose, anchorRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    // 點到選單與觸發按鈕以外的地方就關閉
    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, anchorRef]);

  return (
    <div
      ref={panelRef}
      className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
      aria-label="會員選單"
      aria-hidden={!open}
      inert={!open}
    >
      <ul>
        {memberMenu.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <li key={item.id}>
              <a href={item.href} className={styles.row} onClick={onClose}>
                <span className={styles.rowIcon}>{Icon ? <Icon /> : null}</span>
                <span className={styles.rowLabel}>{item.label}</span>
                <ChevronRightIcon className={styles.rowArrow} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
