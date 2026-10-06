import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import { paymentLabel, shippingLabel } from "@/lib/shipping";
import styles from "./page.module.css";

export const metadata = { title: "會員資料｜LOGO" };
export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");

const dateFmt = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const [cart, orders, favorites] = await Promise.all([
    getCartWithItems(),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    }),
  ]);

  // 手稿第 6 頁的三段購物狀態
  const unpaid = orders.filter((o) => o.paymentStatus === "UNPAID");
  const completed = orders.filter((o) => o.paymentStatus !== "UNPAID");

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.heading}>會員資料</h1>

      {/* 個人資料 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>個人資料</h2>
        <ProfileForm user={user} />
      </section>

      {/* 購物狀態 */}
      <section className={styles.section} id="orders">
        <h2 className={styles.sectionTitle}>購物狀態</h2>

        <div className={styles.status}>
          <h3 className={styles.statusTitle}>
            購物車商品未送出
            <span className={styles.count}>{cart.items.length}</span>
          </h3>
          {cart.items.length === 0 ? (
            <p className={styles.empty}>購物車目前是空的。</p>
          ) : (
            <>
              <ul className={styles.simpleList}>
                {cart.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.variant.product.name}
                      <span className={styles.meta}>
                        {item.variant.size} ／ {item.quantity} 件
                      </span>
                    </span>
                    <span>
                      NT$ {twd.format(item.variant.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/cart" className={styles.inlineLink}>
                前往購物車
              </Link>
            </>
          )}
        </div>

        <div className={styles.status}>
          <h3 className={styles.statusTitle}>
            已送出訂單未付款
            <span className={styles.count}>{unpaid.length}</span>
          </h3>
          {unpaid.length === 0 ? (
            <p className={styles.empty}>目前沒有待付款的訂單。</p>
          ) : (
            <ul className={styles.orderList}>
              {unpaid.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </ul>
          )}
        </div>

        <div className={styles.status}>
          <h3 className={styles.statusTitle}>
            成功送出之訂單
            <span className={styles.count}>{completed.length}</span>
          </h3>
          {completed.length === 0 ? (
            <p className={styles.empty}>目前沒有已完成的訂單。</p>
          ) : (
            <ul className={styles.orderList}>
              {completed.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 收藏清單 */}
      <section className={styles.section} id="favorites">
        <h2 className={styles.sectionTitle}>收藏清單</h2>

        {favorites.length === 0 ? (
          <p className={styles.empty}>還沒有收藏任何商品。</p>
        ) : (
          <ul className={styles.favorites}>
            {favorites.map(({ product }) => {
              const cover = product.images?.[0];
              return (
                <li key={product.id}>
                  <Link href={`/product/${product.slug}`} className={styles.favCard}>
                    <span className={styles.favMedia}>
                      {cover ? (
                        <Image
                          src={cover.url}
                          alt={cover.alt ?? product.name}
                          fill
                          sizes="180px"
                          className={styles.favImage}
                        />
                      ) : null}
                    </span>
                    <span className={styles.favName}>{product.name}</span>
                    <span className={styles.favPrice}>
                      NT$ {twd.format(product.price)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function OrderRow({ order }) {
  return (
    <li className={styles.order}>
      <div className={styles.orderHead}>
        <span className={styles.orderNo}>訂單 {order.orderNo}</span>
        <span className={styles.orderDate}>{dateFmt.format(order.createdAt)}</span>
      </div>

      <ul className={styles.simpleList}>
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

      <div className={styles.orderFoot}>
        <span>
          {shippingLabel(order.shipping)}　{paymentLabel(order.payment)}
        </span>
        <strong>NT$ {twd.format(order.total)}</strong>
      </div>
    </li>
  );
}
