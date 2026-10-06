import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import styles from "./layout.module.css";

export const metadata = { title: "後台｜LOGO" };
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/products", label: "商品資訊" },
  { href: "/admin/orders", label: "訂單資訊" },
  { href: "/admin/members", label: "會員資料" },
  { href: "/admin/stats", label: "銷售統計" },
];

export default async function AdminLayout({ children }) {
  const admin = await requireAdmin();

  return (
    <div className={`container ${styles.wrap}`}>
      <header className={styles.head}>
        <h1 className={styles.title}>後台</h1>
        <span className={styles.who}>{admin.name || admin.email}</span>
      </header>

      <nav className={styles.nav}>
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            {item.label}
          </Link>
        ))}
        <Link href="/" className={styles.backToShop}>
          回前台
        </Link>
      </nav>

      {children}
    </div>
  );
}
