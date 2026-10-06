import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { paymentLabel, shippingLabel } from "@/lib/shipping";
import styles from "./page.module.css";

export const metadata = { title: "訂單完成｜LOGO" };
export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");

export default async function OrderDonePage({ params }) {
  const { orderNo } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.heading}>訂單已送出</h1>
      <p className={styles.lead}>
        訂單編號 <strong>{order.orderNo}</strong>
      </p>

      <dl className={styles.info}>
        <div>
          <dt>收件人</dt>
          <dd>{order.name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{order.email}</dd>
        </div>
        <div>
          <dt>聯絡電話</dt>
          <dd>{order.phone}</dd>
        </div>
        <div>
          <dt>配送方式</dt>
          <dd>{shippingLabel(order.shipping)}</dd>
        </div>
        <div>
          <dt>支付方式</dt>
          <dd>{paymentLabel(order.payment)}</dd>
        </div>
      </dl>

      <ul className={styles.items}>
        {order.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.productName}
              <span className={styles.meta}>
                {item.size} ／ {item.quantity} 件
              </span>
            </span>
            <span>NT$ {twd.format(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className={styles.totals}>
        <div>
          <span>商品小計</span>
          <span>NT$ {twd.format(order.subtotal)}</span>
        </div>
        <div>
          <span>運費</span>
          <span>NT$ {twd.format(order.shipFee)}</span>
        </div>
        <div className={styles.final}>
          <span>總計</span>
          <span>NT$ {twd.format(order.total)}</span>
        </div>
      </div>

      <p className={styles.note}>
        {order.payment === "COD"
          ? "商品將於出貨後以貨到付款方式收款。"
          : "線上付款功能尚在串接中，賣家會另行與你聯絡付款方式。"}
      </p>

      <Link href="/" className={styles.back}>
        回首頁
      </Link>
    </div>
  );
}
