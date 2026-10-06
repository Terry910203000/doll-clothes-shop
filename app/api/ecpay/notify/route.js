import { handleEcpayResult, readEcpayBody } from "@/lib/ecpay-handle";

// 綠界主機對伺服器的付款通知。正式的入帳依據。
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await readEcpayBody(request);
  const result = await handleEcpayResult(body);

  if (!result.ok) {
    console.error("[綠界通知] 未處理：", result.reason);
    // 回非 1|OK 綠界會重送，讓暫時性的失敗有機會補救
    return new Response(`0|${result.reason}`, {
      headers: { "content-type": "text/plain" },
    });
  }

  // 綠界規定收到後必須回傳這串，否則會持續重送
  return new Response("1|OK", { headers: { "content-type": "text/plain" } });
}
