import Link from "next/link";
import CheckoutForm from "@/components/CheckoutForm";
import { getCartWithItems } from "@/lib/cart";
import { getSelectedStore } from "@/lib/cvs";
import { availablePayments } from "@/lib/shipping";
import { ecpayConfig } from "@/lib/ecpay";
import styles from "./page.module.css";

export const metadata = { title: "結帳｜LOGO" };
export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");

export default async function CheckoutPage() {
  const [{ items, subtotal }, cvsStore] = await Promise.all([
    getCartWithItems(),
    getSelectedStore(),
  ]);

  // 綠界金鑰還沒填時，線上付款只會走測試環境收不到錢，所以不開放
  const payments = availablePayments(ecpayConfig().live);

  if (items.length === 0) {
    return (
      <div className={`container ${styles.page}`}>
        <h1 className={styles.heading}>結帳</h1>
        <div className={styles.empty}>
          <p>購物車是空的，沒有可以結帳的商品。</p>
          <Link href="/" className={styles.back}>
            去逛逛商品
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.heading}>結帳</h1>

      <div className={styles.layout}>
        <CheckoutForm subtotal={subtotal} cvsStore={cvsStore} payments={payments} />

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>訂單內容</h2>
          <ul className={styles.summaryList}>
            {items.map((item) => (
              <li key={item.id} className={styles.summaryItem}>
                <span className={styles.summaryName}>
                  {item.variant.product.name}
                  <span className={styles.summaryMeta}>
                    {item.variant.size} ／ {item.quantity} 件
                  </span>
                </span>
                <span className={styles.summaryPrice}>
                  NT$ {twd.format(item.variant.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/cart" className={styles.editCart}>
            修改購物車
          </Link>
        </aside>
      </div>
    </div>
  );
}
