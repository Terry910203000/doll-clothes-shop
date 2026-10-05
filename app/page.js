import SiteHeader from "@/components/SiteHeader";
import FeaturedBanner from "@/components/FeaturedBanner";
import ProductGrid from "@/components/ProductGrid";
import SiteFooter from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <FeaturedBanner />
        <ProductGrid />
      </main>
      <SiteFooter />
    </>
  );
}
