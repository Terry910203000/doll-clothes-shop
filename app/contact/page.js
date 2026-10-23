import { SELLER_CONTACT, telHref } from "@/lib/site";
import styles from "./page.module.css";

export const metadata = { title: "聯絡我們｜Sui 娃娃衣" };

/**
 * 聯絡我們／客服資訊。
 *
 * 頁尾雖然已經有同樣的資料，但首頁商品一多就得捲很久才看得到，
 * 所以另外開一頁，選單點一下就到。內容與 SELLER_CONTACT 同一份來源。
 */
export default function ContactPage() {
  const { name, email, phone, hours } = SELLER_CONTACT;

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.heading}>聯絡我們</h1>
      <p className={styles.intro}>
        {name}
        <br />
        訂單、尺寸或商品有任何問題，都歡迎透過以下方式與我們聯絡。
      </p>

      <dl className={styles.list}>
        {email && (
          <div className={styles.row}>
            <dt>客服信箱</dt>
            <dd>
              <a href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
        )}
        {phone && (
          <div className={styles.row}>
            <dt>客服電話</dt>
            <dd>
              <a href={telHref(phone)}>{phone}</a>
            </dd>
          </div>
        )}
        {hours && (
          <div className={styles.row}>
            <dt>服務時間</dt>
            <dd>{hours}</dd>
          </div>
        )}
      </dl>

      <p className={styles.note}>
        來信請附上訂單編號，我們會在服務時間內盡快回覆。
      </p>
    </div>
  );
}
