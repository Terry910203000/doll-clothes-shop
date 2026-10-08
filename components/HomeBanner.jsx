import Image from "next/image";
import styles from "./HomeBanner.module.css";

/**
 * 首頁頂部的品牌橫幅（設計稿最上方那張圖）
 *
 * 圖片放在 public/banner.jpg（或 .webp / .png），由 app/page.js 偵測後傳進來。
 * 還沒放圖時顯示品牌名稱，版面不會因此塌掉。
 */
export default function HomeBanner({ src }) {
  return (
    <section className={styles.banner} aria-label="品牌橫幅">
      {src ? (
        <Image
          src={src}
          alt="Sui 娃娃衣"
          fill
          sizes="(max-width: 1120px) 100vw, 1120px"
          className={styles.image}
          priority
        />
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.brand}>Sui</span>
          <span className={styles.tagline}>手作娃娃衣</span>
        </div>
      )}
    </section>
  );
}
