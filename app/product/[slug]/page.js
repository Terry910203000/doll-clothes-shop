import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchase from "@/components/ProductPurchase";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import styles from "./page.module.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "找不到商品｜LOGO" };

  return {
    title: `${product.name}｜LOGO`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts({
    categorySlug: product.category.slug,
    excludeSlug: product.slug,
  });

  return (
    <article>
      {/* 上半部：相簿 + 購買區 */}
      <section className={`container ${styles.top}`}>
        <ProductGallery images={product.images} name={product.name} />
        <ProductPurchase product={product} />
      </section>

      {/* 下半部：商品詳情 + 娃尺寸 */}
      <section className={styles.detailWrap}>
        <div className="container">
          <h2 className={styles.detailHeading}>商品詳情</h2>

          <div className={styles.detailBody}>
            <div className={styles.detailText}>
              {product.description
                ? product.description.split("\n").map((line, i) => <p key={i}>{line}</p>)
                : <p>賣家尚未填寫商品詳情。</p>}
            </div>

            {product.sizeChart ? (
              <aside className={styles.sizeChart}>
                <h3 className={styles.sizeChartTitle}>娃尺寸</h3>
                {product.sizeChart.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      {/* 其它搭配 */}
      {related.length > 0 && (
        <section className={`container ${styles.related}`}>
          <h2 className={styles.relatedHeading}>其它搭配</h2>
          <ul className={styles.relatedGrid}>
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
