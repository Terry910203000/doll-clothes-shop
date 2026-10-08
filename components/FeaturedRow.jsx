import ProductCard from "./ProductCard";
import styles from "./FeaturedRow.module.css";

/**
 * 主打商品：三個並排（設計稿的樣式）
 *
 * 先前版本是一次一張的輪播，依品牌設計稿改成並排。
 */
export default function FeaturedRow({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <section className={styles.section} aria-label="主打商品">
      <h2 className={styles.heading}>主打商品</h2>

      <ul className={styles.row}>
        {items.slice(0, 3).map((item) => (
          <li key={item.id}>
            <ProductCard product={item} priority />
          </li>
        ))}
      </ul>
    </section>
  );
}
