import { existsSync } from "node:fs";
import path from "node:path";
import HomeBanner from "@/components/HomeBanner";
import FeaturedRow from "@/components/FeaturedRow";
import ProductGrid from "@/components/ProductGrid";
import { getFeaturedProducts, getProducts } from "@/lib/queries";

// 版面要顯示登入狀態，所以每次請求都重新產生（不能預先靜態化）

/** 找出放在 public/ 根目錄的橫幅圖，沒放就回 null */
function findBanner() {
  for (const name of ["banner.webp", "banner.jpg", "banner.jpeg", "banner.png"]) {
    if (existsSync(path.join(process.cwd(), "public", name))) return `/${name}`;
  }
  return null;
}

export default async function HomePage() {
  const [featured, products] = await Promise.all([
    getFeaturedProducts(),
    getProducts(),
  ]);

  return (
    <div className="container">
      <HomeBanner src={findBanner()} />
      <FeaturedRow items={featured} />
      <ProductGrid products={products} />
    </div>
  );
}
