import { prisma } from "./prisma";

/**
 * 銷售統計（手稿第 12 頁）
 *
 * 只計入已付款的訂單，未付款的還不算業績。
 */
const PAID = { paymentStatus: "PAID" };

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

/** 依粒度產生一段連續的時間刻度，沒有銷售的期間也要出現在圖上 */
function buckets(granularity) {
  const now = new Date();
  const list = [];

  if (granularity === "day") {
    const start = addDays(startOfDay(now), -29);
    for (let i = 0; i < 30; i++) {
      const from = addDays(start, i);
      list.push({ from, to: addDays(from, 1), label: `${from.getMonth() + 1}/${from.getDate()}` });
    }
  } else if (granularity === "month") {
    const base = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let i = 11; i >= 0; i--) {
      const from = addMonths(base, -i);
      list.push({ from, to: addMonths(from, 1), label: `${from.getMonth() + 1}月` });
    }
  } else {
    const year = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const from = new Date(year - i, 0, 1);
      list.push({ from, to: new Date(year - i + 1, 0, 1), label: `${year - i}` });
    }
  }

  return list;
}

export async function getSalesSeries(granularity = "day") {
  const list = buckets(granularity);
  const first = list[0].from;

  // 一次撈回範圍內的明細，在記憶體裡分桶，比每個刻度各查一次快得多
  const items = await prisma.orderItem.findMany({
    where: { order: { ...PAID, paidAt: { gte: first } } },
    select: { quantity: true, unitPrice: true, order: { select: { paidAt: true } } },
  });

  return list.map((b) => {
    let qty = 0;
    let amount = 0;
    for (const it of items) {
      const t = it.order.paidAt;
      if (t && t >= b.from && t < b.to) {
        qty += it.quantity;
        amount += it.unitPrice * it.quantity;
      }
    }
    return { label: b.label, qty, amount };
  });
}

/** 今日 / 本月 / 今年 的件數與金額 */
export async function getSalesTotals() {
  const now = new Date();
  const ranges = {
    day: startOfDay(now),
    month: new Date(now.getFullYear(), now.getMonth(), 1),
    year: new Date(now.getFullYear(), 0, 1),
  };

  const out = {};
  for (const [key, from] of Object.entries(ranges)) {
    const items = await prisma.orderItem.findMany({
      where: { order: { ...PAID, paidAt: { gte: from } } },
      select: { quantity: true, unitPrice: true },
    });
    out[key] = {
      qty: items.reduce((s, i) => s + i.quantity, 0),
      amount: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    };
  }
  return out;
}

/** 銷量排名前五（手稿第 12 頁下半） */
export async function getTopProducts(take = 5) {
  const items = await prisma.orderItem.findMany({
    where: { order: PAID },
    select: { productName: true, quantity: true, unitPrice: true, variantId: true },
  });

  const byName = new Map();
  for (const it of items) {
    const row = byName.get(it.productName) ?? { name: it.productName, qty: 0, amount: 0 };
    row.qty += it.quantity;
    row.amount += it.unitPrice * it.quantity;
    byName.set(it.productName, row);
  }

  return [...byName.values()].sort((a, b) => b.qty - a.qty).slice(0, take);
}
