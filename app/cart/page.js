import Link from "next/link";
import CartRow from "@/components/CartRow";
import { getCartWithItems } from "@/lib/cart";
import styles from "./page.module.css";

export const metadata = { title: "購物車｜LOGO" };

// 購物車隨 cookie 而異，不能被快取成靜態頁
export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");

export default async function CartPage() {
  const { items, subtotal } = await getCartWithItems();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.heading}>購物車</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>購物車目前是空的。</p>
          <Link href="/" className={styles.keepShopping}>
            去逛逛商品
          </Link>
        </div>
      ) : (
        <>
          <ul className={styles.list}>
            {items.map((item) => (
              <CartRow key={item.id} item={item} />
            ))}
          </ul>

          <div className={styles.summary}>
            <span className={styles.summaryLabel}>總金額</span>
            <span className={styles.summaryValue}>共 NT$ {twd.format(subtotal)}</span>
          </div>

          <div className={styles.checkoutRow}>
            <Link href="/checkout" className={styles.checkout}>
              結賬
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
