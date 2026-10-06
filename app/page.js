import FeaturedBanner from "@/components/FeaturedBanner";
import ProductGrid from "@/components/ProductGrid";
import { getFeaturedProducts, getProducts } from "@/lib/queries";

// 首頁預先產生靜態內容，但最多快取 60 秒；
// 後台改動商品時另外呼叫 revalidatePath("/") 立即更新。
export const revalidate = 60;

export default async function HomePage() {
  const [featured, products] = await Promise.all([
    getFeaturedProducts(),
    getProducts(),
  ]);

  return (
    <>
      <FeaturedBanner items={featured} />
      <ProductGrid products={products} />
    </>
  );
}
