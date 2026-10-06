# 部署到 Vercel

整體架構：

| 項目 | 服務 | 免費額度 |
| --- | --- | --- |
| 網站主機 | Vercel | 個人專案免費 |
| 資料庫 | Supabase（PostgreSQL） | 500MB |
| 商品圖片 | Supabase Storage | 1GB |
| 寄信 | Resend | 每月 3000 封（需自有網域） |
| 金流 | 綠界 ECPay | 依交易抽成 |

> Vercel 的檔案系統是唯讀的，而且每次部署都會重置，
> 所以資料庫不能用 SQLite、圖片也不能存在主機上 —— 這就是要接 Supabase 的原因。

---

## 1. 建立資料庫（Supabase）

1. 到 [supabase.com](https://supabase.com) 用 GitHub 登入
2. **New project**，Region 選 **Southeast Asia (Singapore)**，
   設一組資料庫密碼（請自己記下來）
3. 專案建好後點上方 **Connect**，會看到兩種連線字串，**兩個都要複製**：
   - **Transaction pooler**（連接埠 6543）→ 填進 `.env` 的 `DATABASE_URL`
   - **Direct connection**（連接埠 5432）→ 填進 `.env` 的 `DIRECT_URL`

   分開的原因：Vercel 這種環境每個請求都是獨立的，必須走連線池才不會把
   資料庫連線數用光；但建立資料表的操作連線池不支援，得走直連。

本機第一次使用，或之後改過 schema：

```bash
npx prisma migrate deploy   # 建立資料表
npm run db:seed             # 放進分類、商品與管理員帳號
```

## 2. 商品圖片（Supabase Storage）

1. Supabase 後台 → **Storage** → **New bucket**，名稱 `products`，
   **勾選 Public bucket**（商品圖要讓所有人看得到）
2. **Project Settings → Storage → S3 access keys** → **New access key**
3. 填進 `.env`（`你的專案代號` 就是網址 `https://xxxxx.supabase.co` 中的 xxxxx）：

```
S3_ENDPOINT=https://你的專案代號.supabase.co/storage/v1/s3
S3_REGION=ap-southeast-1
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=products
S3_PUBLIC_URL=https://你的專案代號.supabase.co/storage/v1/object/public/products
```

沒填的話圖片會存在本機 `public/uploads/`，在 Vercel 上會遺失。

## 3. 寄信（Resend，可選）

沒設定時信件內容只會印在伺服器日誌，網站其他功能不受影響。
要真的寄出需要自有網域，步驟見 `.env.example`。

## 4. 推上 GitHub

```bash
git remote add origin https://github.com/你的帳號/doll-clothes-shop.git
git push -u origin main
```

## 5. 部署

1. 到 [vercel.com](https://vercel.com) 用 GitHub 登入 → **Add New Project** → 選這個 repo
2. **Environment Variables** 把 `.env` 裡的每一項都加進去
   （`.env` 不在版控裡，Vercel 讀不到，必須手動填）：

   | 變數 | 必填 |
   | --- | --- |
   | `DATABASE_URL` | ✅ Supabase 連線池字串 |
   | `DIRECT_URL` | ✅ Supabase 直連字串 |
   | `AUTH_SECRET` | ✅ 登入簽章金鑰 |
   | `APP_URL` | ✅ 部署後的網址 |
   | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | 只有要在線上跑 seed 時需要 |
   | `S3_*` | 要能在後台上傳圖片就必填 |
   | `RESEND_API_KEY` / `MAIL_FROM` | 要真的寄信才填 |

3. **Deploy**

第一次部署完成後，在本機把 `.env` 指向線上資料庫，執行一次
`npx prisma migrate deploy` 與 `npm run db:seed`，線上才會有商品資料。

## 之後的更新

推到 GitHub 的 `main` 分支，Vercel 會自動重新部署。
改過 `prisma/schema.prisma` 的話，記得對線上資料庫跑 `npx prisma migrate deploy`。

---

## 本機開發要怎麼跑

換成 PostgreSQL 之後，本機也需要一個 Postgres。兩種方式擇一：

**A. 直接連 Supabase**（最簡單，不用裝東西）
把連線字串填進 `.env` 就好。缺點是本機和線上共用同一份資料，
開發時的誤操作會影響線上。要分開的話就在 Supabase 另外開一個專案當開發用。

**B. 用 Docker 在本機跑一個**

```bash
docker run -d --name cloth-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cloth postgres:17-alpine
```

然後 `.env` 填（本機不需要連線池，兩個填一樣即可）：

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cloth"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/cloth"
```

---

## 關於 Supabase 免費方案的暫停機制

專案連續 7 天完全沒有任何連線就會被暫停，需要到後台手動恢復。
網站真的有客人之後不會發生；開張初期如果還沒流量，記得偶爾打開看一下。
