import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import styles from "@/components/admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <>
      <div className={styles.pageHead}>
        <h2 className={styles.pageTitle}>編輯商品</h2>
      </div>
      <ProductForm categories={categories} product={product} />
    </>
  );
}
