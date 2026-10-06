"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { removeCartItem, updateCartItem } from "@/app/actions/cart";
import { TrashIcon } from "./Icons";
import styles from "./CartRow.module.css";

const twd = new Intl.NumberFormat("zh-TW");

/**
 * 購物車的一列商品（手稿第 4 頁）
 * 圖片 ／ 品名 ／ 數量 −3+ ／ 價格 ／ 刪除
 */
export default function CartRow({ item }) {
  const [pending, startTransition] = useTransition();

  const product = item.variant.product;
  const cover = product.images?.[0];
  const max = item.variant.stock;
  const lineTotal = product.price * item.quantity;

  const setQty = (quantity) => {
    startTransition(async () => {
      await updateCartItem({ itemId: item.id, quantity });
    });
  };

  const remove = () => {
    startTransition(async () => {
      await removeCartItem({ itemId: item.id });
    });
  };

  return (
    <li className={`${styles.row} ${pending ? styles.pending : ""}`}>
      <Link href={`/product/${product.slug}`} className={styles.media}>
        {cover ? (
          <Image src={cover.url} alt={cover.alt ?? product.name} fill sizes="160px" className={styles.image} />
        ) : null}
      </Link>

      <div className={styles.info}>
        <Link href={`/product/${product.slug}`} className={styles.name}>
          {product.name}
        </Link>

        <p className={styles.size}>尺寸：{item.variant.size}</p>

        <div className={styles.qtyRow}>
          <span className={styles.label}>數量</span>
          <div className={styles.stepper}>
            <button
              type="button"
              onClick={() => setQty(item.quantity - 1)}
              disabled={pending || item.quantity <= 1}
              aria-label="減少數量"
            >
              −
            </button>
            <span className={styles.qty}>{item.quantity}</span>
            <button
              type="button"
              onClick={() => setQty(item.quantity + 1)}
              disabled={pending || item.quantity >= max}
              aria-label="增加數量"
            >
              ＋
            </button>
          </div>
        </div>

        <p className={styles.price}>
          <span className={styles.label}>價格</span>
          <span className={styles.priceValue}>NT$ {twd.format(lineTotal)}</span>
        </p>
      </div>

      <button
        type="button"
        className={styles.remove}
        onClick={remove}
        disabled={pending}
        aria-label={`從購物車移除 ${product.name}`}
      >
        <TrashIcon />
      </button>
    </li>
  );
}
