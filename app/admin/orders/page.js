import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/app/actions/admin-orders";
import { shippingLabel } from "@/lib/shipping";
import { cvsLabel } from "@/lib/cvs";
import StatusSelect from "@/components/StatusSelect";
import styles from "@/components/admin.module.css";

export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");
const dateFmt = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const PAYMENT_STATUS = [
  { value: "UNPAID", label: "未付款" },
  { value: "PAID", label: "已付款" },
  { value: "REFUNDED", label: "已退款" },
];

const SHIP_STATUS = [
  { value: "PENDING", label: "未出貨" },
  { value: "SHIPPED", label: "已出貨" },
  { value: "RECEIVED", label: "已收貨" },
];

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { email: true } } },
  });

  return (
    <>
      <div className={styles.pageHead}>
        <h2 className={styles.pageTitle}>訂單資訊</h2>
      </div>

      {orders.length === 0 ? (
        <p className={styles.empty}>還沒有訂單。</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>訂單編號</th>
                <th>日期</th>
                <th>會員</th>
                <th className={styles.wrapCell}>訂購種類</th>
                <th>訂購數量</th>
                <th>金額</th>
                <th>出貨方式</th>
                <th>付款狀態</th>
                <th>收貨狀態</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const qty = o.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <tr key={o.id}>
                    <td>{o.orderNo}</td>
                    <td>{dateFmt.format(o.createdAt)}</td>
                    <td>
                      {o.name}
                      <br />
                      <span className={styles.hint}>{o.user?.email ?? o.email}</span>
                    </td>
                    <td className={styles.wrapCell}>
                      {o.items.map((i) => (
                        <div key={i.id}>
                          {i.productName}（{i.size}）×{i.quantity}
                        </div>
                      ))}
                    </td>
                    <td>{qty}</td>
                    <td>NT$ {twd.format(o.total)}</td>
                    <td className={styles.wrapCell}>
                      {shippingLabel(o.shipping)}
                      {o.cvsStoreName ? (
                        <>
                          <br />
                          <span className={styles.hint}>
                            {cvsLabel(o.cvsSubType)} {o.cvsStoreName}（{o.cvsStoreId}）
                          </span>
                        </>
                      ) : null}
                    </td>
                    <td>
                      <StatusSelect
                        action={updateOrderStatus}
                        id={o.id}
                        field="paymentStatus"
                        value={o.paymentStatus}
                        options={PAYMENT_STATUS}
                        label={`訂單 ${o.orderNo} 的付款狀態`}
                      />
                    </td>
                    <td>
                      <StatusSelect
                        action={updateOrderStatus}
                        id={o.id}
                        field="shipStatus"
                        value={o.shipStatus}
                        options={SHIP_STATUS}
                        label={`訂單 ${o.orderNo} 的收貨狀態`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
