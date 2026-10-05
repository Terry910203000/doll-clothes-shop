import { GmailIcon, InstagramIcon } from "./Icons";
import styles from "./SiteFooter.module.css";

// TODO: 換成實際的帳號與信箱
const socials = [
  { id: "instagram", label: "Instagram", href: "#", Icon: InstagramIcon },
  { id: "gmail", label: "Gmail", href: "mailto:", Icon: GmailIcon },
];

/**
 * 頁尾社群圖示，顏色 rgb(99,49,49)。
 */
export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
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

      <p className={styles.copy}>© {new Date().getFullYear()} LOGO</p>
    </footer>
  );
}
