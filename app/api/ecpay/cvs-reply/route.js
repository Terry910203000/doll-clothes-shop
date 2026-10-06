import { isValidCvsType, saveSelectedStore } from "@/lib/cvs";

// 消費者在綠界地圖選完門市後，綠界會把門市資料 POST 回這裡。
// 這個頁面是開在新視窗裡的，所以存完門市後通知母視窗更新再自己關掉。
export const dynamic = "force-dynamic";

function closingPage(message) {
  return new Response(
    `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>門市已選擇</title></head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:48px;color:#633131">
<p>${message}</p>
<script>
  try { window.opener && window.opener.postMessage('cvs-store-selected', window.location.origin); } catch (e) {}
  if (window.opener) { window.close(); }
  else { window.location.replace('/checkout'); }
</script>
<noscript><a href="/checkout">回到結帳頁</a></noscript>
</body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function POST(request) {
  const form = await request.formData();

  const storeId = String(form.get("CVSStoreID") ?? "").trim();
  const subType = String(form.get("ExtraData") ?? "").trim();

  if (!storeId) return closingPage("沒有取得門市資料，請再試一次。");

  await saveSelectedStore({
    subType: isValidCvsType(subType) ? subType : null,
    storeId,
    storeName: String(form.get("CVSStoreName") ?? "").trim(),
    address: String(form.get("CVSAddress") ?? "").trim(),
    phone: String(form.get("CVSTelephone") ?? "").trim(),
  });

  return closingPage("門市已選擇，正在返回結帳頁⋯");
}
