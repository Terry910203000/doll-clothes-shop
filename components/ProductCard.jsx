import styles from "./ProductCard.module.css";

const twd = new Intl.NumberFormat("zh-TW");

/**
 * 商品卡：圖片（尚未上傳時顯示色塊佔位）／ 品名 ／ 價格
 * 色塊底色由 ProductGrid 的 nth-child 交錯決定。
 */
export default function ProductCard({ product }) {
  return (
    <article className={styles.card}>
      <a href={`/product/${product.id}`} className={styles.link}>
        <div className={styles.media}>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <span className={styles.mediaLabel}>{product.size}</span>
          )}
        </div>

        <h3 className={styles.name}>{product.name}</h3>

        <p className={styles.price}>
          <span className={styles.currency}>NT$</span>
          {twd.format(product.price)}
        </p>
      </a>
    </article>
  );
}
