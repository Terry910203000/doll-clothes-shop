# 娃娃衣商品網站

手作娃娃衣的電商網站，版面依手繪稿製作。目前完成「首頁」。

## 技術

- Next.js 16（App Router）
- React 19
- CSS Modules（無額外 UI 套件）

## 開始開發

```bash
npm install
npm run dev
```

開啟 http://localhost:3000

## 資料庫

```bash
npx prisma migrate dev --name <說明>   # 改完 prisma/schema.prisma 後執行
npm run db:seed                        # 重建分類與商品（會員與訂單保留）
npm run db:studio                      # 用瀏覽器檢視資料
```

> **改過 schema 之後要重開 dev server。**
> Next.js 會把產生出來的 Prisma Client 快取在記憶體裡，
> 不重開會出現「Cannot read properties of undefined」這類錯誤。

帳號密碼、資料庫位置等設定放在 `.env`（不進版控），
需要哪些變數請看 `.env.example`。

## 商品照片

原始照片放在 `衣服照片/`（不進版控），執行下列指令壓成網頁用的 WebP：

```bash
npm run images
```

## 後台

登入後從右上角會員選單進入，或直接開 `/admin`。只有 `role` 為 `ADMIN`
的帳號進得去，其他人會被導回首頁。

| 頁面 | 說明 |
| --- | --- |
| `/admin` | 總覽：各項數量與待處理事項 |
| `/admin/products` | 商品列表，含已售／總量／剩餘庫存 |
| `/admin/products/new` | 新增商品（可多張上傳，自動壓縮成 WebP） |
| `/admin/orders` | 訂單列表，付款／收貨狀態可直接下拉修改 |
| `/admin/members` | 會員列表，備註欄離開欄位即自動儲存 |
| `/admin/stats` | 銷售趨勢折線圖、今日／本月／今年、銷量排名 |

後台上傳的圖片走 `lib/storage.js`：`.env` 有填 `R2_*` 就存 Cloudflare R2，
沒填就存本機 `public/uploads/`（不進版控）。換儲存服務只要改 `.env`。

## 外部服務

兩項都是「沒設定就自動退回本機行為」，不會因為沒申請而壞掉。
需要哪些變數與申請步驟都寫在 `.env.example` 裡。

| 服務 | 沒設定時 | 設定後 |
| --- | --- | --- |
| Resend（寄信） | 信件內容印在終端機 | 真的寄出重設密碼信、訂單通知信 |
| Cloudflare R2（圖片） | 存在本機 `public/uploads/` | 存到 R2，網址由 `R2_PUBLIC_URL` 組出 |

設定 R2 後記得重開 dev server，`next.config.mjs` 要讀 `R2_PUBLIC_URL`
才會允許 `next/image` 載入該網域的圖片。

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
