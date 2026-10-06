import Link from "next/link";
import styles from "./page.module.css";

export const metadata = { title: "付款未完成｜LOGO" };

export default function CheckoutFailedPage() {
  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.heading}>付款未完成</h1>
      <p className={styles.text}>
        這筆付款沒有成功完成，款項不會被扣除。
        <br />
        如果你已經看到扣款，請與我們聯絡並提供訂單編號。
      </p>
      <div className={styles.actions}>
        <Link href="/cart" className={styles.primary}>
          回購物車
        </Link>
        <Link href="/" className={styles.secondary}>
          回首頁
        </Link>
      </div>
    </div>
  );
}
