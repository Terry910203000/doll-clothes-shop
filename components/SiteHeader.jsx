"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { CartIcon, MenuIcon, UserIcon } from "./Icons";
import SideMenu from "./SideMenu";
import MemberMenu from "./MemberMenu";
import styles from "./SiteHeader.module.css";

/**
 * 頂部列：漢堡選單（左）／ LOGO（中）／ 會員 + 購物車（右）
 * 底色 rgb(189,154,130)，文字與圖示 rgb(147,90,36)。
 */
export default function SiteHeader({ categories = [] }) {
  const [sideOpen, setSideOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const memberBtnRef = useRef(null);

  const closeMember = useCallback(() => setMemberOpen(false), []);
  const closeSide = useCallback(() => setSideOpen(false), []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <button
            className={styles.iconBtn}
            onClick={() => {
              setSideOpen(true);
              setMemberOpen(false);
            }}
            aria-label="開啟商品分類選單"
            aria-expanded={sideOpen}
          >
            <MenuIcon />
          </button>

          <Link href="/" className={styles.logo}>
            LOGO
          </Link>

          <div className={styles.actions}>
            <button
              ref={memberBtnRef}
              className={styles.iconBtn}
              onClick={() => setMemberOpen((v) => !v)}
              aria-label="會員選單"
              aria-expanded={memberOpen}
            >
              <UserIcon />
            </button>

            <Link href="/cart" className={styles.iconBtn} aria-label="購物車">
              <CartIcon />
            </Link>

            <MemberMenu
              open={memberOpen}
              onClose={closeMember}
              anchorRef={memberBtnRef}
            />
          </div>
        </div>
      </header>

      <SideMenu open={sideOpen} onClose={closeSide} categories={categories} />
    </>
  );
}
