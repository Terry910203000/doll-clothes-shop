import Image from "next/image";
import Link from "next/link";
import styles from "./ProductCard.module.css";

const twd = new Intl.NumberFormat("zh-TW");

/**
 * 商品卡：照片 ／ 品名 ／ 價格
 * 色塊底色由 ProductGrid 的 nth-child 交錯決定，沒照片時才看得到。
 */
export default function ProductCard({ product, priority = false }) {
  const cover = product.images?.[0];

  return (
    <article className={styles.card}>
      <Link href={`/product/${product.slug}`} className={styles.link}>
        <div className={styles.media}>
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt ?? product.name}
              fill
              // 桌機三欄、平板兩欄、手機滿版，讓瀏覽器挑合適尺寸的圖
              sizes="(max-width: 820px) 50vw, 33vw"
              className={styles.image}
              priority={priority}
            />
          ) : (
            <span className={styles.mediaLabel}>準備中</span>
          )}
        </div>

        <h3 className={styles.name}>{product.name}</h3>

        <p className={styles.price}>
          <span className={styles.currency}>NT$</span>
          {twd.format(product.price)}
        </p>
      </Link>
    </article>
  );
}
