import { captchaSvg, issueCaptcha } from "@/lib/captcha";

// Server Component 不能寫 cookie，認證碼改由這個路由發放：
// 產生代碼 → 把雜湊寫進 cookie → 回傳畫好的圖
export const dynamic = "force-dynamic";

export async function GET() {
  const svg = captchaSvg(await issueCaptcha());

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // 絕對不能被瀏覽器或 CDN 快取，否則每次都是同一張
      "cache-control": "no-store, max-age=0, must-revalidate",
    },
  });
}
