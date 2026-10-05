import "./globals.css";

export const metadata = {
  title: "LOGO｜娃娃衣專賣",
  description: "手作娃娃衣專賣店，提供 30CM / 16CM / 10CM 各尺寸娃衣。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        {/* 中文字型；離線或載入失敗時會自動退回系統字型 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
