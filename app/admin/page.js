import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");

export default async function AdminHome() {
  const [members, products, orders, unpaid, pending, sold, revenue] =
    await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: "UNPAID" } }),
      prisma.order.count({ where: { shipStatus: "PENDING" } }),
      prisma.orderItem.aggregate({ _sum: { quantity: true } }),
      prisma.order.aggregate({ _sum: { total: true } }),
    ]);

  const cards = [
    { href: "/admin/members", label: "會員資料", value: members, unit: "位會員" },
    { href: "/admin/products", label: "商品資訊", value: products, unit: "項商品" },
    { href: "/admin/orders", label: "訂單資訊", value: orders, unit: "筆訂單" },
    {
      href: "/admin/stats",
      label: "銷售統計",
      value: sold._sum.quantity ?? 0,
      unit: "件售出",
    },
  ];

  return (
    <>
      <ul className={styles.cards}>
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className={styles.card}>
              <span className={styles.cardLabel}>{c.label}</span>
              <span className={styles.cardValue}>{twd.format(c.value)}</span>
              <span className={styles.cardUnit}>{c.unit}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className={styles.alerts}>
        <h2 className={styles.alertsTitle}>待處理</h2>
        <ul className={styles.alertList}>
          <li>
            <span>未付款訂單</span>
            <strong>{unpaid} 筆</strong>
          </li>
          <li>
            <span>尚未出貨</span>
            <strong>{pending} 筆</strong>
          </li>
          <li>
            <span>營業額累計</span>
            <strong>NT$ {twd.format(revenue._sum.total ?? 0)}</strong>
          </li>
        </ul>
      </section>
    </>
  );
}
