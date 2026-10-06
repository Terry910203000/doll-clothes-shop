import { buildMapForm, isValidCvsType } from "@/lib/cvs";

// 轉送到綠界的門市電子地圖。
// 綠界只接受 POST，所以回一張會自動送出的表單。
export const dynamic = "force-dynamic";

function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

export async function POST(request) {
  const form = await request.formData();
  const subType = String(form.get("subType") ?? "");

  if (!isValidCvsType(subType)) {
    return Response.redirect(`${appUrl()}/checkout?cvs=invalid`, 303);
  }

  const map = buildMapForm({
    subType,
    replyUrl: `${appUrl()}/api/ecpay/cvs-reply`,
  });

  const inputs = Object.entries(map.fields)
    .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}">`)
    .join("");

  // 這頁只是個跳板，使用者幾乎不會看到
  return new Response(
    `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>前往選擇門市</title></head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:64px;color:#633131">
<p>正在開啟門市地圖⋯</p>
<form id="f" action="${escapeHtml(map.action)}" method="POST">${inputs}
<button type="submit">沒有自動跳轉？點這裡</button></form>
<script>document.getElementById('f').submit()</script>
</body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
