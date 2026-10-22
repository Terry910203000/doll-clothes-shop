import { GmailIcon, InstagramIcon } from "./Icons";
import { SELLER_CONTACT, telHref } from "@/lib/site";
import styles from "./SiteFooter.module.css";

/**
 * 頁尾社群圖示與聯絡資訊，顏色 rgb(99,49,49)。
 *
 * 聯絡信箱與電話是綠界收款審核的必要項目，資料沒填就不顯示那一列，
 * 避免頁面上出現空的 mailto: 連結。
 */
export default function SiteFooter() {
  const { name, email, phone, hours, instagram } = SELLER_CONTACT;

  const socials = [
    instagram && {
      id: "instagram",
      label: "Instagram",
      href: instagram,
      Icon: InstagramIcon,
    },
    email && { id: "gmail", label: "Gmail", href: `mailto:${email}`, Icon: GmailIcon },
  ].filter(Boolean);

  return (
    <footer className={styles.footer}>
      {socials.length > 0 && (
        <ul className={styles.socials}>
          {socials.map(({ id, label, href, Icon }) => {
            // 寄信連結交給使用者的郵件軟體，不需要另開分頁
            const isExternal = href.startsWith("http");

            return (
              <li key={id}>
                <a
                  href={href}
                  className={styles.socialBtn}
                  aria-label={label}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer noopener" : undefined}
                >
                  <Icon />
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <dl className={styles.contact}>
        {email && (
          <div className={styles.contactRow}>
            <dt>客服信箱</dt>
            <dd>
              <a href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
        )}
        {phone && (
          <div className={styles.contactRow}>
            <dt>客服電話</dt>
            <dd>
              <a href={telHref(phone)}>{phone}</a>
            </dd>
          </div>
        )}
        {hours && (
          <div className={styles.contactRow}>
            <dt>服務時間</dt>
            <dd>{hours}</dd>
          </div>
        )}
      </dl>

      <p className={styles.copy}>
        © {new Date().getFullYear()} {name}
      </p>
    </footer>
  );
}
