import ProductForm from "@/components/ProductForm";
import { getCategories } from "@/lib/queries";
import styles from "@/components/admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <>
      <div className={styles.pageHead}>
        <h2 className={styles.pageTitle}>新增商品</h2>
      </div>
      <ProductForm categories={categories} />
    </>
  );
}
