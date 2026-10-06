import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { paymentLabel, shippingLabel } from "@/lib/shipping";
import styles from "./page.module.css";

export const metadata = { title: "訂單完成｜LOGO" };
export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");

export default async function OrderDonePage({ params, searchParams }) {
  const { orderNo } = await params;
  const sp = await searchParams;

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.heading}>
        {order.paymentStatus === "PAID" ? "付款完成" : "訂單已送出"}
      </h1>
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

      {order.paymentStatus === "PAID" ? (
        <p className={styles.note}>已收到款項，我們會盡快為你出貨。</p>
      ) : order.payment === "COD" ? (
        <p className={styles.note}>商品將於出貨後以貨到付款方式收款。</p>
      ) : (
        <>
          <p className={styles.note}>
            {sp?.pending
              ? "這筆付款尚未完成。款項不會被扣除，你可以重新付款。"
              : "這筆訂單還沒完成付款。"}
          </p>
          <Link href={`/pay/${order.orderNo}`} className={styles.payAgain}>
            前往付款
          </Link>
        </>
      )}

      <Link href="/" className={styles.back}>
        回首頁
      </Link>
    </div>
  );
}
