"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createProduct, updateProduct } from "@/app/actions/admin-products";
import styles from "./admin.module.css";
import own from "./ProductForm.module.css";

const DEFAULT_SIZES = [
  { size: "S", stock: 0 },
  { size: "M", stock: 0 },
  { size: "L", stock: 0 },
];

/**
 * 新增／編輯商品（手稿第 10 頁）
 * product 有值就是編輯，沒有就是新增。
 */
export default function ProductForm({ categories, product = null }) {
  const isEdit = Boolean(product);
  const [state, action, pending] = useActionState(
    isEdit ? updateProduct : createProduct,
    null,
  );
  const errors = state?.errors ?? {};
  const v = state?.values ?? {};

  const [sizes, setSizes] = useState(
    product?.variants?.length
      ? product.variants.map((x) => ({ size: x.size, stock: x.stock }))
      : DEFAULT_SIZES,
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const setSize = (i, key, value) => {
    setSizes((prev) => prev.map((s, j) => (j === i ? { ...s, [key]: value } : s)));
  };

  return (
    <form action={action} className={styles.form}>
      {isEdit ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className={styles.field}>
        <label htmlFor="name">商品名稱</label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={v.name ?? product?.name ?? ""}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <p className={styles.error}>{errors.name}</p> : null}
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label htmlFor="categoryId">分類</label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={v.categoryId ?? product?.categoryId ?? ""}
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">請選擇</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <p className={styles.error}>{errors.categoryId}</p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="price">價格（NT$）</label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            defaultValue={v.price ?? product?.price ?? ""}
            aria-invalid={Boolean(errors.price)}
          />
          {errors.price ? <p className={styles.error}>{errors.price}</p> : null}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="model">MODEL（娃娃三圍）</label>
        <input
          id="model"
          name="model"
          type="text"
          placeholder="身高 30cm / 胸圍 28cm / 腰圍 26cm"
          defaultValue={v.model ?? product?.model ?? ""}
        />
      </div>

      {/* 尺寸與庫存 */}
      <div className={styles.field}>
        <span className={styles.fieldLabel}>尺寸與庫存</span>

        <ul className={own.sizes}>
          {sizes.map((s, i) => (
            <li key={i} className={own.sizeRow}>
              <input
                name="sizeName"
                type="text"
                value={s.size}
                onChange={(e) => setSize(i, "size", e.target.value)}
                placeholder="尺寸"
                aria-label={`第 ${i + 1} 個尺寸名稱`}
                className={own.sizeName}
              />
              <input
                name="sizeStock"
                type="number"
                min={0}
                value={s.stock}
                onChange={(e) => setSize(i, "stock", e.target.value)}
                placeholder="庫存"
                aria-label={`第 ${i + 1} 個尺寸庫存`}
                className={own.sizeStock}
              />
              <button
                type="button"
                className={own.sizeRemove}
                onClick={() => setSizes((p) => p.filter((_, j) => j !== i))}
                disabled={sizes.length <= 1}
                aria-label={`移除第 ${i + 1} 個尺寸`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={own.addSize}
          onClick={() => setSizes((p) => [...p, { size: "", stock: 0 }])}
        >
          ＋ 新增尺寸
        </button>

        {errors.sizes ? <p className={styles.error}>{errors.sizes}</p> : null}
      </div>

      {/* 既有照片 */}
      {isEdit && product.images.length > 0 ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>目前的照片（勾選要刪除的）</span>
          <ul className={own.existing}>
            {product.images.map((img) => (
              <li key={img.id}>
                <label className={own.existingItem}>
                  <span className={own.existingMedia}>
                    <Image src={img.url} alt="" fill sizes="110px" className={own.existingImg} />
                  </span>
                  <span className={own.existingCheck}>
                    <input type="checkbox" name="removeImage" value={img.id} />
                    刪除
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.field}>
        <label htmlFor="images">{isEdit ? "再加照片" : "商品照片"}</label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
        />
        <p className={styles.hint}>
          可一次選多張，第一張會當作封面。上傳後會自動壓成網頁用的尺寸。
        </p>
        {errors.images ? <p className={styles.error}>{errors.images}</p> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="description">商品詳情</label>
        <textarea
          id="description"
          name="description"
          defaultValue={v.description ?? product?.description ?? ""}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="sizeChart">娃尺寸說明</label>
        <textarea
          id="sizeChart"
          name="sizeChart"
          defaultValue={v.sizeChart ?? product?.sizeChart ?? ""}
        />
      </div>

      {/* 主打商品 */}
      <div className={styles.field}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="featured"
            value="1"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          設為首頁主打商品
        </label>

        {featured ? (
          <input
            name="featuredCaption"
            type="text"
            placeholder="主打標籤，例如 NEW、限量預購中"
            defaultValue={v.featuredCaption ?? product?.featuredCaption ?? ""}
          />
        ) : null}
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={pending}
        >
          {pending ? "儲存中…" : isEdit ? "儲存變更" : "新增商品"}
        </button>
        <Link href="/admin/products" className={styles.btn}>
          取消
        </Link>
      </div>
    </form>
  );
}
