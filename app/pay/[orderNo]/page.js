import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPaymentForm } from "@/lib/ecpay";
import EcpayRedirect from "@/components/EcpayRedirect";

export const metadata = { title: "前往付款｜LOGO" };
export const dynamic = "force-dynamic";

function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export default async function PayPage({ params }) {
  const { orderNo } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });

  if (!order) notFound();

  // 已付款或貨到付款都不該再進金流頁
  if (order.paymentStatus === "PAID" || order.payment === "COD") {
    redirect(`/checkout/done/${orderNo}`);
  }

  const base = appUrl();
  const form = buildPaymentForm({
    order,
    returnUrl: `${base}/api/ecpay/notify`,
    resultUrl: `${base}/api/ecpay/result`,
    clientUrl: `${base}/checkout/done/${orderNo}`,
  });

  // 記下送出去的交易編號，之後對帳與處理客訴要用
  await prisma.order.update({
    where: { id: order.id },
    data: { merchantTradeNo: form.fields.MerchantTradeNo },
  });

  return <EcpayRedirect form={form} orderNo={orderNo} />;
}
