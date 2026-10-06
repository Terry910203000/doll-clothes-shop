/**
 * 寄信層。
 *
 * 設定了 RESEND_API_KEY 就真的寄出，否則把內容印在伺服器終端機，
 * 這樣還沒申請好網域與寄信服務時，整個流程仍然可以在本機測試。
 */

export function emailDriver() {
  return process.env.RESEND_API_KEY ? "resend" : "console";
}

function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

async function send({ to, subject, html, text }) {
  if (emailDriver() === "console") {
    console.log(`\n[信件未寄出 — 尚未設定 RESEND_API_KEY]\n收件人：${to}\n主旨：${subject}\n${text}\n`);
    return { ok: true, driver: "console" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM ?? "no-reply@example.com",
    to,
    subject,
    html,
    text,
  });

  if (error) {
    // 不要把寄信失敗往上丟到使用者眼前，
    // 否則等於告訴對方「這個信箱存在，只是寄失敗」
    console.error("[寄信失敗]", error);
    return { ok: false, driver: "resend" };
  }

  return { ok: true, driver: "resend" };
}

/** 重設密碼信 */
export function sendPasswordResetEmail({ to, token }) {
  const link = `${appUrl()}/reset/${token}`;

  return send({
    to,
    subject: "重設你的密碼",
    text: `請點下面的連結重設密碼（30 分鐘內有效）：\n${link}\n\n如果不是你本人操作，請忽略這封信。`,
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.8;color:#633131">
        <h2 style="font-size:18px;margin:0 0 16px">重設你的密碼</h2>
        <p style="margin:0 0 20px">請點下面的按鈕重設密碼，連結 30 分鐘內有效。</p>
        <p style="margin:0 0 24px">
          <a href="${link}"
             style="display:inline-block;padding:12px 28px;border-radius:6px;background:#935A24;color:#fff;text-decoration:none">
            重設密碼
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;opacity:.75">按鈕沒反應的話，請複製這個網址：</p>
        <p style="margin:0 0 24px;font-size:13px;word-break:break-all">${link}</p>
        <p style="margin:0;font-size:13px;opacity:.75">如果不是你本人操作，請忽略這封信。</p>
      </div>
    `,
  });
}

/** 訂單成立通知 */
export function sendOrderEmail({ to, order }) {
  const link = `${appUrl()}/checkout/done/${order.orderNo}`;
  const lines = order.items
    .map((i) => `・${i.productName}（${i.size}）× ${i.quantity}`)
    .join("\n");

  return send({
    to,
    subject: `訂單 ${order.orderNo} 已成立`,
    text: `謝謝你的訂購！\n\n訂單編號：${order.orderNo}\n${lines}\n\n總計：NT$ ${order.total}\n\n查看訂單：${link}`,
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.8;color:#633131">
        <h2 style="font-size:18px;margin:0 0 16px">訂單 ${order.orderNo} 已成立</h2>
        <p style="margin:0 0 16px">謝謝你的訂購！以下是這筆訂單的內容：</p>
        <ul style="margin:0 0 16px;padding-left:20px">
          ${order.items
            .map(
              (i) =>
                `<li>${i.productName}（${i.size}）× ${i.quantity}　NT$ ${i.unitPrice * i.quantity}</li>`,
            )
            .join("")}
        </ul>
        <p style="margin:0 0 24px;font-size:16px"><strong>總計：NT$ ${order.total}</strong></p>
        <p style="margin:0"><a href="${link}" style="color:#935A24">查看訂單</a></p>
      </div>
    `,
  });
}
