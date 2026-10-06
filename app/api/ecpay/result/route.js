import { redirect } from "next/navigation";
import { handleEcpayResult, readEcpayBody } from "@/lib/ecpay-handle";

// 付款完成後由消費者的瀏覽器 POST 回來，用途是立刻讓他看到結果。
// 真正的入帳以 /api/ecpay/notify 為準。
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await readEcpayBody(request);
  const result = await handleEcpayResult(body);

  if (!result.ok) {
    redirect("/checkout/failed");
  }

  redirect(
    result.paid
      ? `/checkout/done/${result.orderNo}`
      : `/checkout/done/${result.orderNo}?pending=1`,
  );
}
