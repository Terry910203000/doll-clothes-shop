"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import {
  ChevronRightIcon,
  HeartIcon,
  LoginIcon,
  LogoutIcon,
  ReceiptIcon,
  UserIcon,
} from "./Icons";
import styles from "./MemberMenu.module.css";

// 已登入時顯示的項目（手稿第 2 頁的淺藍色選單）
const memberLinks = [
  { id: "wishlist", label: "收藏清單", href: "/account#favorites", Icon: HeartIcon },
  { id: "profile", label: "個人資料", href: "/account", Icon: UserIcon },
  { id: "orders", label: "購買記錄", href: "/account#orders", Icon: ReceiptIcon },
];

export default function MemberMenu({ open, onClose, anchorRef, user }) {
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
      {user ? (
        <>
          <p className={styles.who}>{user.name || user.email}</p>

          <ul>
            {memberLinks.map(({ id, label, href, Icon }) => (
              <li key={id}>
                <Link href={href} className={styles.row} onClick={onClose}>
                  <span className={styles.rowIcon}>
                    <Icon />
                  </span>
                  <span className={styles.rowLabel}>{label}</span>
                  <ChevronRightIcon className={styles.rowArrow} />
                </Link>
              </li>
            ))}

            {user.role === "ADMIN" ? (
              <li>
                <Link href="/admin" className={styles.row} onClick={onClose}>
                  <span className={styles.rowIcon}>
                    <ReceiptIcon />
                  </span>
                  <span className={styles.rowLabel}>後台管理</span>
                  <ChevronRightIcon className={styles.rowArrow} />
                </Link>
              </li>
            ) : null}

            <li>
              {/* 登出會改變伺服器狀態，用表單送出而非連結 */}
              <form action={logout}>
                <button type="submit" className={styles.row} onClick={onClose}>
                  <span className={styles.rowIcon}>
                    <LogoutIcon />
                  </span>
                  <span className={styles.rowLabel}>登出</span>
                </button>
              </form>
            </li>
          </ul>
        </>
      ) : (
        <ul>
          <li>
            <Link href="/login" className={styles.row} onClick={onClose}>
              <span className={styles.rowIcon}>
                <LoginIcon />
              </span>
              <span className={styles.rowLabel}>會員登入</span>
              <ChevronRightIcon className={styles.rowArrow} />
            </Link>
          </li>
          <li>
            <Link href="/register" className={styles.row} onClick={onClose}>
              <span className={styles.rowIcon}>
                <UserIcon />
              </span>
              <span className={styles.rowLabel}>會員註冊</span>
              <ChevronRightIcon className={styles.rowArrow} />
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
