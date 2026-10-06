/**
 * 把「衣服照片/」裡的原始照片壓成適合網頁的大小，輸出到 public/products/。
 *
 * 原圖 3072x4096、每張約 1MB，直接放上網頁會讓使用者下載過久，
 * 這支腳本統一轉成最長邊 1400px 的 WebP。
 *
 * 用法：node scripts/prepare-images.mjs
 */
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = "衣服照片";
const OUT_DIR = path.join("public", "products");
const MAX_EDGE = 1400;
const QUALITY = 78;

// 檔名形如「cloth12正面.jpg」
const NAME_RE = /^cloth(\d+)(正面|反面)\.jpe?g$/i;

const SIDE_SLUG = { 正面: "front", 反面: "back" };

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR)).filter((f) => NAME_RE.test(f));
  if (files.length === 0) {
    console.error(`在 ${SRC_DIR}/ 找不到符合 clothN正面.jpg 的檔案`);
    process.exitCode = 1;
    return;
  }

  // 依商品編號、正面在前排序
  files.sort((a, b) => {
    const [, na, sa] = a.match(NAME_RE);
    const [, nb, sb] = b.match(NAME_RE);
    return Number(na) - Number(nb) || (sa === "正面" ? -1 : 1) - (sb === "正面" ? -1 : 1);
  });

  const manifest = {};
  let totalIn = 0;
  let totalOut = 0;

  for (const file of files) {
    const [, num, side] = file.match(NAME_RE);
    const outName = `cloth${num}-${SIDE_SLUG[side]}.webp`;
    const outPath = path.join(OUT_DIR, outName);

    const srcPath = path.join(SRC_DIR, file);
    const input = sharp(srcPath);
    const meta = await input.metadata();
    const srcSize = (await stat(srcPath)).size;

    const buf = await input
      .rotate() // 依 EXIF 轉正，否則直式照片可能躺著
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    await writeFile(outPath, buf);

    totalIn += srcSize;
    totalOut += buf.length;

    (manifest[num] ??= []).push(`/products/${outName}`);

    console.log(
      `${file.padEnd(24)} ${meta.width}x${meta.height} → ${outName}  ${(buf.length / 1024).toFixed(0)} KB`,
    );
  }

  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  console.log(
    `\n共 ${files.length} 張，${(totalIn / 1024 / 1024).toFixed(1)} MB → ${(totalOut / 1024 / 1024).toFixed(1)} MB`,
  );
  console.log(`清單已寫入 ${path.join(OUT_DIR, "manifest.json")}`);
}

main();
