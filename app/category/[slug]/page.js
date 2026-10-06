import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { getCategories, getProducts } from "@/lib/queries";

async function findCategory(slug) {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await findCategory(slug);
  return { title: category ? `${category.name}｜LOGO` : "找不到分類｜LOGO" };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await findCategory(slug);

  if (!category) notFound();

  const products = await getProducts({ categorySlug: slug });

  return <ProductGrid products={products} title={category.name} />;
}
