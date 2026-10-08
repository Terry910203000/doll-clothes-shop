import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

/**
 * 商品網格，桌機三欄、手機兩欄。
 */
export default function ProductGrid({ products = [], title }) {
  if (products.length === 0) {
    return (
      <section className={`container ${styles.section}`}>
        <p className={styles.empty}>這個分類還沒有商品。</p>
      </section>
    );
  }

  return (
    <section className={`container ${styles.section}`} aria-label={title ?? "商品列表"}>
      {title ? <h1 className={styles.title}>{title}</h1> : null}

      <ul className={styles.grid}>
        {products.map((product, i) => (
          <li key={product.id}>
            <ProductCard product={product} priority={i < 3} />
          </li>
        ))}
      </ul>
    </section>
  );
}
