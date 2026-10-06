"use client";

import { useActionState, useState } from "react";
import { createOrder } from "@/app/actions/checkout";
import {
  PAYMENT_OPTIONS,
  POLICIES,
  SHIPPING_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/shipping";
import CvsPicker from "./CvsPicker";
import styles from "./CheckoutForm.module.css";

const twd = new Intl.NumberFormat("zh-TW");

/**
 * 結帳表單（手稿第 5 頁）
 * 聯絡資料 → 支付方式 → 政策確認 → 留言 → 付款
 */
export default function CheckoutForm({ subtotal, cvsStore = null }) {
  // 所有欄位都是非受控（defaultValue / defaultChecked）：
  // React 在 Server Action 送出後會重設表單，受控欄位會因為 state 沒變
  // 而不被寫回 DOM，造成畫面顯示有選、送出卻是空的。
  // 這裡改由 action 回傳的 values 決定預設值，state 只用來驅動畫面變化。
  const [state, action, pending] = useActionState(createOrder, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  // 從綠界門市地圖回來時整頁會重新載入，
  // 既然已經選了門市，配送方式就該自動回到超商取貨
  const [shipping, setShipping] = useState(
    values.shipping || (cvsStore ? "CVS_PICKUP" : ""),
  );
  const [source, setSource] = useState(values.source ?? "");

  const fee = SHIPPING_OPTIONS.find((o) => o.value === shipping)?.fee ?? 0;

  return (
    <form action={action} className={styles.form} noValidate>
      {/* 聯絡資料 */}
      <section className={styles.section}>
        <h2 className={styles.legend}>聯絡資料</h2>

        <div className={styles.field}>
          <label htmlFor="email">EMail</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={values.email}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className={styles.error}>{errors.email}</p> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="name">姓名</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={values.name}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className={styles.error}>{errors.name}</p> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="phone">聯絡電話</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={values.phone}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone ? <p className={styles.error}>{errors.phone}</p> : null}
        </div>

        <fieldset className={styles.choices}>
          <legend className={styles.choicesLegend}>配送方式</legend>
          {SHIPPING_OPTIONS.map((o) => (
            <label key={o.value} className={styles.choice}>
              <input
                type="radio"
                name="shipping"
                value={o.value}
                defaultChecked={
                  values.shipping
                    ? values.shipping === o.value
                    : Boolean(cvsStore) && o.value === "CVS_PICKUP"
                }
                onChange={() => setShipping(o.value)}
              />
              <span>{o.label}</span>
              <span className={styles.choiceFee}>運費 NT$ {twd.format(o.fee)}</span>
            </label>
          ))}
          {errors.shipping ? <p className={styles.error}>{errors.shipping}</p> : null}

          {/* 選了超商取貨才要挑門市 */}
          {shipping === "CVS_PICKUP" ? (
            <CvsPicker store={cvsStore} error={errors.cvsStore} />
          ) : null}
        </fieldset>
      </section>

      {/* 支付方式 */}
      <section className={styles.section}>
        <h2 className={styles.legend}>支付方式</h2>
        <fieldset className={styles.choices}>
          {PAYMENT_OPTIONS.map((o) => (
            <label key={o.value} className={styles.choiceLine}>
              <input
                type="radio"
                name="payment"
                value={o.value}
                defaultChecked={values.payment === o.value}
              />
              <span>{o.label}</span>
            </label>
          ))}
          {errors.payment ? <p className={styles.error}>{errors.payment}</p> : null}
        </fieldset>
      </section>

      {/* 政策確認 */}
      <section className={styles.section}>
        <h2 className={styles.legend}>政策確認</h2>
        <fieldset className={styles.choices}>
          {POLICIES.map((p) => (
            <label key={p.id} className={styles.policy}>
              <input
                type="checkbox"
                name={p.id}
                value="1"
                defaultChecked={Boolean(values[p.id])}
              />
              <span>{p.label}</span>
            </label>
          ))}
          {errors.policies ? <p className={styles.error}>{errors.policies}</p> : null}
        </fieldset>
      </section>

      {/* 留言 */}
      <section className={styles.section}>
        <h2 className={styles.legend}>留言</h2>
        <p className={styles.question}>從哪知道此商品？</p>
        <fieldset className={styles.choices}>
          <div className={styles.sourceRow}>
            {SOURCE_OPTIONS.map((o) => (
              <label key={o.value} className={styles.sourceBtn}>
                <input
                  type="radio"
                  name="source"
                  value={o.value}
                  defaultChecked={values.source === o.value}
                  onChange={() => setSource(o.value)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>

          {source === "OTHER" ? (
            <input
              className={styles.sourceOther}
              name="sourceOther"
              type="text"
              placeholder="請說明"
              defaultValue={values.sourceOther}
              aria-label="其它來源說明"
            />
          ) : null}

          {errors.source ? <p className={styles.error}>{errors.source}</p> : null}
        </fieldset>
      </section>

      {/* 金額與送出 */}
      <section className={styles.total}>
        <div className={styles.totalRow}>
          <span>商品小計</span>
          <span>NT$ {twd.format(subtotal)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>運費</span>
          <span>{shipping ? `NT$ ${twd.format(fee)}` : "選擇配送方式後計算"}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.totalFinal}`}>
          <span>總計</span>
          <span>NT$ {twd.format(subtotal + fee)}</span>
        </div>
      </section>

      {errors.cart ? <p className={styles.errorBox}>{errors.cart}</p> : null}

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "處理中…" : "付款"}
      </button>
    </form>
  );
}
