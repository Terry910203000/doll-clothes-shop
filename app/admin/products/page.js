import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/app/actions/admin-products";
import styles from "@/components/admin.module.css";
import own from "./page.module.css";

export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");

export default async function AdminProductsPage() {
  const [products, soldRows] = await Promise.all([
    prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    // 每個尺寸賣出多少，用來算手稿上的「賣出 / 總數」
    prisma.orderItem.groupBy({
      by: ["variantId"],
      _sum: { quantity: true },
    }),
  ]);

  const soldByVariant = new Map(
    soldRows.map((r) => [r.variantId, r._sum.quantity ?? 0]),
  );

  return (
    <>
      <div className={styles.pageHead}>
        <h2 className={styles.pageTitle}>商品資訊</h2>
        <Link href="/admin/products/new" className={`${styles.btn} ${styles.btnPrimary}`}>
          ＋ 新增商品
        </Link>
      </div>

      {products.length === 0 ? (
        <p className={styles.empty}>還沒有商品。</p>
      ) : (
        <ul className={own.grid}>
          {products.map((p) => {
            const cover = p.images[0];
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            const sold = p.variants.reduce(
              (s, v) => s + (soldByVariant.get(v.id) ?? 0),
              0,
            );

            return (
              <li key={p.id} className={own.card}>
                <Link href={`/admin/products/${p.id}`} className={own.media}>
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt=""
                      fill
                      sizes="220px"
                      className={own.image}
                    />
                  ) : (
                    <span className={own.noImage}>無照片</span>
                  )}
                </Link>

                <div className={own.body}>
                  <Link href={`/admin/products/${p.id}`} className={own.name}>
                    {p.name}
                  </Link>

                  <p className={own.meta}>
                    {p.category.name}　NT$ {twd.format(p.price)}
                    {p.featured ? <span className={own.badge}>主打</span> : null}
                  </p>

                  <p className={own.numbers}>
                    已售 <strong>{sold}</strong> ／ 總量{" "}
                    <strong>{sold + stock}</strong>
                  </p>
                  <p className={own.numbers}>
                    剩餘數量 <strong>{stock}</strong>
                  </p>

                  <ul className={own.sizes}>
                    {p.variants.map((v) => (
                      <li key={v.id} className={v.stock === 0 ? own.sizeOut : ""}>
                        {v.size} {v.stock}
                      </li>
                    ))}
                  </ul>

                  <div className={own.actions}>
                    <Link href={`/admin/products/${p.id}`} className={styles.btn}>
                      編輯
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnDanger}`}
                      >
                        刪除
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
