import { GlobeIcon, InstagramIcon } from "./Icons";
import styles from "./SiteFooter.module.css";

// TODO: 換成實際的社群連結（第二個圖示手稿上看不清楚，先放通用圖示）
const socials = [
  { id: "instagram", label: "Instagram", href: "#", Icon: InstagramIcon },
  { id: "site", label: "官方網站", href: "#", Icon: GlobeIcon },
];

/**
 * 頁尾社群圖示，顏色 rgb(99,49,49)。
 */
export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.socials}>
        {socials.map(({ id, label, href, Icon }) => (
          <li key={id}>
            <a
              href={href}
              className={styles.socialBtn}
              aria-label={label}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>

      <p className={styles.copy}>© {new Date().getFullYear()} LOGO</p>
    </footer>
  );
}
