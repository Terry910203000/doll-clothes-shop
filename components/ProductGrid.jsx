import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

/**
 * 首頁商品網格，桌機三欄、手機兩欄。
 * 卡片底色依手繪稿交錯使用兩個褐色。
 */
export default function ProductGrid() {
  return (
    <section className={`container ${styles.section}`} aria-label="商品列表">
      <ul className={styles.grid}>
        {products.map((product) => (
          <li key={product.id} className={styles.cell}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
