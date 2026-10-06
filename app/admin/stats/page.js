import Link from "next/link";
import SalesChart from "@/components/SalesChart";
import { getSalesSeries, getSalesTotals, getTopProducts } from "@/lib/stats";
import styles from "@/components/admin.module.css";
import own from "./page.module.css";

export const dynamic = "force-dynamic";

const twd = new Intl.NumberFormat("zh-TW");

const GRANULARITY = [
  { value: "day", label: "日" },
  { value: "month", label: "月" },
  { value: "year", label: "年" },
];

export default async function AdminStatsPage({ searchParams }) {
  const sp = await searchParams;
  const g = GRANULARITY.some((x) => x.value === sp?.g) ? sp.g : "day";

  const [series, totals, top] = await Promise.all([
    getSalesSeries(g),
    getSalesTotals(),
    getTopProducts(5),
  ]);

  const maxQty = Math.max(1, ...top.map((t) => t.qty));

  return (
    <>
      <div className={styles.pageHead}>
        <h2 className={styles.pageTitle}>銷售統計</h2>

        {/* 篩選器放在圖表上方一列 */}
        <div className={own.filters}>
          {GRANULARITY.map((x) => (
            <Link
              key={x.value}
              href={`/admin/stats?g=${x.value}`}
              className={`${own.filter} ${g === x.value ? own.filterOn : ""}`}
              aria-current={g === x.value}
            >
              {x.label}
            </Link>
          ))}
        </div>
      </div>

      <p className={styles.hint}>只計入已付款的訂單。</p>

      <section className={own.card}>
        <h3 className={own.cardTitle}>
          銷售趨勢（{GRANULARITY.find((x) => x.value === g).label}）
        </h3>
        <SalesChart data={series} />
      </section>

      <section className={own.totals}>
        {[
          { key: "day", label: "今日" },
          { key: "month", label: "本月" },
          { key: "year", label: "今年" },
        ].map((t) => (
          <div key={t.key} className={own.total}>
            <span className={own.totalLabel}>{t.label}</span>
            <span className={own.totalValue}>{twd.format(totals[t.key].qty)} 件</span>
            <span className={own.totalAmount}>
              NT$ {twd.format(totals[t.key].amount)}
            </span>
          </div>
        ))}
      </section>

      <section className={own.card}>
        <h3 className={own.cardTitle}>銷量排名</h3>

        {top.length === 0 ? (
          <p className={styles.empty}>還沒有已付款的訂單。</p>
        ) : (
          <ol className={own.rank}>
            {top.map((p, i) => (
              <li key={p.name} className={own.rankRow}>
                <span className={own.rankNo}>{i + 1}</span>
                <span className={own.rankName}>{p.name}</span>
                <span className={own.rankBarWrap}>
                  <span
                    className={own.rankBar}
                    style={{ width: `${(p.qty / maxQty) * 100}%` }}
                  />
                </span>
                <span className={own.rankQty}>{p.qty} 件</span>
                <span className={own.rankAmount}>NT$ {twd.format(p.amount)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
