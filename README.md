# 娃娃衣商品網站

手作娃娃衣的電商網站，版面依手繪稿製作。目前完成「首頁」。

## 技術

- Next.js 15（App Router）
- React 19
- CSS Modules（無額外 UI 套件）

## 開始開發

```bash
npm install
npm run dev
```

開啟 http://localhost:3000

## 配色

全部定義在 `app/globals.css` 的 `:root`，改這裡就會全站同步。

| 變數 | 色值 | 用途 |
| --- | --- | --- |
| `--c-bar` | `rgb(189,154,130)` | 頂部列底色 |
| `--c-logo` | `rgb(147,90,36)` | LOGO 與頂部圖示 |
| `--c-banner` | `rgb(147,102,35)` | 主打商品橫幅 |
| `--c-text` | `rgb(99,49,49)` | 商品文字、價格、社群圖示 |
| `--c-card-a` / `--c-card-b` | 同上兩個褐色 | 商品卡片交錯底色 |
| `--c-menu-pink` | `#f7dfe8` | 左側分類選單 |
| `--c-menu-blue` | `#dce8f7` | 會員下拉選單 |

## 檔案結構

```
app/
  layout.js            # 共用外框、字型、metadata
  page.js              # 首頁組裝
  globals.css          # 設計代幣與全站基礎樣式
components/
  SiteHeader.jsx       # 頂部列（漢堡 / LOGO / 會員 / 購物車）
  SideMenu.jsx         # 左側粉紅分類抽屜
  MemberMenu.jsx       # 右上淺藍會員下拉
  FeaturedBanner.jsx   # 主打商品橫幅輪播
  ProductGrid.jsx      # 商品網格
  ProductCard.jsx      # 單張商品卡
  SiteFooter.jsx       # 頁尾社群圖示
  Icons.jsx            # 共用 SVG 圖示
data/
  categories.js        # 側邊選單分類
  memberMenu.js        # 會員選單項目
  products.js          # 商品與主打商品（目前為假資料）
```

## 換成真實內容

1. **商品**：編輯 `data/products.js`，把照片放到 `public/products/` 後填入 `image: "/products/xxx.jpg"`。
2. **分類**：編輯 `data/categories.js`。
3. **社群連結**：編輯 `components/SiteFooter.jsx` 的 `socials`。

## 待辦

- [ ] 商品詳情頁
- [ ] 購物車
- [ ] 分類列表頁
- [ ] 會員登入／收藏清單／購買記錄
