"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";
import { toggleFavorite } from "@/app/actions/favorite";
import { HeartIcon } from "./Icons";
import styles from "./ProductPurchase.module.css";

const twd = new Intl.NumberFormat("zh-TW");

/**
 * 商品詳情頁右側的購買區（手稿第 3 頁）
 * 尺寸 → 數量 → 收藏 / 加入購物車 → 分享
 */
export default function ProductPurchase({ product, favorited = false }) {
  const inStock = product.variants.filter((v) => v.stock > 0);
  const [variantId, setVariantId] = useState(inStock[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();
  const [isFav, setIsFav] = useState(favorited);
  const router = useRouter();

  const selected = product.variants.find((v) => v.id === variantId);
  const max = selected?.stock ?? 0;

  const changeQty = (next) => {
    setQty(Math.min(Math.max(1, next), Math.max(1, max)));
  };

  const submit = () => {
    if (!variantId) return;
    startTransition(async () => {
      setResult(await addToCart({ variantId, quantity: qty }));
    });
  };

  // 伺服器端沒有 window，先留空再於掛載後補上，避免 hydration 不一致
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => setShareUrl(window.location.href), []);

  const shares = [
    { id: "line", label: "LINE", href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}` },
    { id: "fb", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { id: "gmail", label: "Gmail", href: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <div className={styles.panel}>
      <h1 className={styles.name}>{product.name}</h1>

      <p className={styles.price}>
        <span className={styles.currency}>NT$</span>
        {twd.format(product.price)}
      </p>

      {product.description ? (
        <p className={styles.desc}>{product.description}</p>
      ) : null}

      {/* 尺寸 */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>尺寸</span>
        <div className={styles.sizes}>
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`${styles.size} ${v.id === variantId ? styles.sizeActive : ""}`}
              onClick={() => {
                setVariantId(v.id);
                setQty(1);
                setResult(null);
              }}
              disabled={v.stock <= 0}
              title={v.stock <= 0 ? "已售完" : `剩餘 ${v.stock} 件`}
              aria-pressed={v.id === variantId}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      {product.model ? (
        <div className={styles.row}>
          <span className={styles.rowLabel}>MODEL</span>
          <span className={styles.rowValue}>{product.model}</span>
        </div>
      ) : null}

      {/* 數量 */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>數量</span>
        <div className={styles.stepper}>
          <button type="button" onClick={() => changeQty(qty - 1)} disabled={qty <= 1} aria-label="減少數量">
            −
          </button>
          <input
            type="number"
            value={qty}
            min={1}
            max={Math.max(1, max)}
            onChange={(e) => changeQty(Number(e.target.value))}
            aria-label="數量"
          />
          <button type="button" onClick={() => changeQty(qty + 1)} disabled={qty >= max} aria-label="增加數量">
            ＋
          </button>
        </div>
        <span className={styles.stock}>
          {max > 0 ? `剩餘 ${max} 件` : "已售完"}
        </span>
      </div>

      {/* 動作 */}
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.fav} ${isFav ? styles.favOn : ""}`}
          aria-pressed={isFav}
          aria-label={isFav ? "從收藏清單移除" : "加入收藏清單"}
          onClick={() =>
            startTransition(async () => {
              const r = await toggleFavorite({ productId: product.id });
              // 未登入就先去登入，登入後回到這一頁
              if (r.needLogin) {
                router.push(`/login?next=/product/${product.slug}`);
                return;
              }
              setIsFav(r.favorited);
            })
          }
        >
          <HeartIcon />
          {isFav ? "已收藏" : "收藏"}
        </button>

        <button
          type="button"
          className={styles.addToCart}
          onClick={submit}
          disabled={!variantId || max <= 0 || pending}
        >
          {pending ? "加入中…" : "加入購物車"}
        </button>
      </div>

      {result ? (
        <p
          className={`${styles.result} ${result.ok ? styles.resultOk : styles.resultErr}`}
          role="status"
        >
          {result.message}
          {result.ok ? (
            <a href="/cart" className={styles.resultLink}>
              前往購物車
            </a>
          ) : null}
        </p>
      ) : null}

      {/* 分享 */}
      <div className={styles.share}>
        <span className={styles.rowLabel}>分享</span>
        {shares.map((s) => (
          <a
            key={s.id}
            href={s.href}
            className={styles.shareBtn}
            target="_blank"
            rel="noreferrer noopener"
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
