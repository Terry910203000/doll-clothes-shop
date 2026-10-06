import FeaturedBanner from "@/components/FeaturedBanner";
import ProductGrid from "@/components/ProductGrid";
import { getFeaturedProducts, getProducts } from "@/lib/queries";

// 版面要顯示登入狀態，所以每次請求都重新產生（不能預先靜態化）

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
