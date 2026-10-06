"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_UPLOAD = 12 * 1024 * 1024; // 12MB，原始手機照片通常在這之內
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/**
 * 存一張商品照。
 *
 * 一律用 sharp 重新編碼成 WebP：既壓掉手機原圖的龐大體積，
 * 也等於過濾掉偽裝成圖片的檔案（解不開就會丟例外）。
 */
async function saveImage(file) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > MAX_UPLOAD) throw new Error("圖片超過 12MB");
  if (!ALLOWED.has(file.type)) throw new Error("只接受 JPG / PNG / WebP / AVIF");

  const buf = Buffer.from(await file.arrayBuffer());
  const out = await sharp(buf)
    .rotate() // 依 EXIF 轉正
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();

  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.webp`;
  await writeFile(path.join(UPLOAD_DIR, name), out);

  return `/uploads/${name}`;
}

/** 刪掉自己上傳的檔案；種子商品的圖在 public/products/ 下，不碰 */
async function removeUpload(url) {
  if (!url?.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", url.replace("/uploads/", "uploads/")));
  } catch {
    // 檔案本來就不在就算了，不該因此讓整個操作失敗
  }
}

function parseSizes(form) {
  // 尺寸與庫存成對送上來：sizeName[] / sizeStock[]
  const names = form.getAll("sizeName").map((v) => String(v).trim());
  const stocks = form.getAll("sizeStock").map((v) => Math.max(0, Number(v) || 0));

  const seen = new Set();
  const result = [];

  names.forEach((size, i) => {
    if (!size || seen.has(size)) return;
    seen.add(size);
    result.push({ size, stock: stocks[i] ?? 0, sortOrder: result.length + 1 });
  });

  return result;
}

function parseFields(form) {
  return {
    name: String(form.get("name") ?? "").trim(),
    categoryId: String(form.get("categoryId") ?? ""),
    price: Math.max(0, Math.round(Number(form.get("price")) || 0)),
    model: String(form.get("model") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    sizeChart: String(form.get("sizeChart") ?? "").trim(),
    featured: Boolean(form.get("featured")),
    featuredCaption: String(form.get("featuredCaption") ?? "").trim(),
  };
}

function validate(fields, sizes) {
  const errors = {};
  if (!fields.name) errors.name = "請填寫商品名稱";
  if (!fields.categoryId) errors.categoryId = "請選擇分類";
  if (fields.price <= 0) errors.price = "請填寫價格";
  if (sizes.length === 0) errors.sizes = "至少要有一個尺寸";
  return errors;
}

/**
 * 由商品名稱產生網址用的代稱，重複時加流水號。
 *
 * 只保留 ASCII：中文字放進網址要經過百分比編碼，比對時容易出錯，
 * 所以純中文品名改用一段短隨機碼當代稱。
 */
async function uniqueSlug(name, excludeId) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || `p-${randomUUID().slice(0, 8)}`;

  for (let i = 0; ; i++) {
    const slug = i === 0 ? base : `${base}-${i}`;
    const found = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) return slug;
  }
}

export async function createProduct(_prevState, form) {
  await requireAdmin("/admin/products/new");

  const fields = parseFields(form);
  const sizes = parseSizes(form);
  const errors = validate(fields, sizes);

  if (Object.keys(errors).length > 0) return { ok: false, errors, values: fields };

  let images;
  try {
    const files = form.getAll("images").filter((f) => f && f.size > 0);
    const urls = [];
    for (const file of files) {
      const url = await saveImage(file);
      if (url) urls.push(url);
    }
    images = urls;
  } catch (e) {
    return { ok: false, errors: { images: e.message }, values: fields };
  }

  await prisma.product.create({
    data: {
      ...fields,
      featuredCaption: fields.featured ? fields.featuredCaption || null : null,
      model: fields.model || null,
      description: fields.description || null,
      sizeChart: fields.sizeChart || null,
      slug: await uniqueSlug(fields.name),
      variants: { create: sizes },
      images: {
        create: images.map((url, i) => ({ url, alt: fields.name, sortOrder: i + 1 })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(_prevState, form) {
  await requireAdmin("/admin/products");

  const id = String(form.get("id") ?? "");
  const fields = parseFields(form);
  const sizes = parseSizes(form);
  const errors = validate(fields, sizes);

  if (Object.keys(errors).length > 0) return { ok: false, errors, values: fields };

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!existing) return { ok: false, errors: { name: "找不到這項商品" }, values: fields };

  let newImages = [];
  try {
    const files = form.getAll("images").filter((f) => f && f.size > 0);
    for (const file of files) {
      const url = await saveImage(file);
      if (url) newImages.push(url);
    }
  } catch (e) {
    return { ok: false, errors: { images: e.message }, values: fields };
  }

  // 被勾選刪除的照片
  const removeIds = form.getAll("removeImage").map(String);
  if (removeIds.length > 0) {
    const rows = await prisma.productImage.findMany({
      where: { id: { in: removeIds }, productId: id },
    });
    await prisma.productImage.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
    for (const row of rows) await removeUpload(row.url);
  }

  // 尺寸：沿用原本的列才能保住已經賣出的關聯，沒留下的才刪掉
  const keep = new Set();
  for (const s of sizes) {
    const old = existing.variants.find((v) => v.size === s.size);
    if (old) {
      keep.add(old.id);
      await prisma.productVariant.update({
        where: { id: old.id },
        data: { stock: s.stock, sortOrder: s.sortOrder },
      });
    } else {
      const created = await prisma.productVariant.create({
        data: { productId: id, ...s },
      });
      keep.add(created.id);
    }
  }
  await prisma.productVariant.deleteMany({
    where: { productId: id, id: { notIn: [...keep] } },
  });

  const maxSort = await prisma.productImage.aggregate({
    where: { productId: id },
    _max: { sortOrder: true },
  });
  let sort = maxSort._max.sortOrder ?? 0;

  await prisma.product.update({
    where: { id },
    data: {
      ...fields,
      featuredCaption: fields.featured ? fields.featuredCaption || null : null,
      model: fields.model || null,
      description: fields.description || null,
      sizeChart: fields.sizeChart || null,
      slug: await uniqueSlug(fields.name, id),
      images: {
        create: newImages.map((url) => ({ url, alt: fields.name, sortOrder: ++sort })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/product/${existing.slug}`);
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(formData) {
  await requireAdmin("/admin/products");

  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) return;

  await prisma.product.delete({ where: { id } });
  for (const img of product.images) await removeUpload(img.url);

  revalidatePath("/admin/products");
  revalidatePath("/");
}
