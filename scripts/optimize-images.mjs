/*
 * One-time/reproducible image optimizer for public/images (dev tool, run with
 * `bun run optimize:images`).
 *
 * FORMAT DETECTION IS CONTENT-BASED (sharp metadata), NEVER EXTENSION-BASED.
 * Some supplied assets are PNGs with alpha mislabelled `.jpeg`; trusting the
 * extension fed them to the JPEG re-encoder, which flattened transparency onto
 * black (the "black background" bug this guard now prevents).
 *
 * Policy:
 *  - Any image that HAS an alpha channel (regardless of extension) and is
 *    > 250 KB -> WebP q80 with alpha preserved. Source removed; the script
 *    reports renames so references can be updated (a `.jpeg` that is really a
 *    transparent PNG becomes a proper `.webp`).
 *  - Genuine, non-alpha JPEGs > 600 KB -> re-encoded in place at mozjpeg q74
 *    progressive (photographic content; no transparency to lose).
 *  - Everything else is left alone. Re-running is a no-op.
 *
 * sharp is a devDependency only; nothing here ships to the browser bundle.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = "public/images";
const ALPHA_MIN_KB = 250;
const JPEG_MIN_KB = 600;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const renames = [];
let savedKb = 0;

for (const file of walk(ROOT)) {
  if (file.endsWith(".DS_Store")) continue;

  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch {
    continue; // unreadable / not a raster we can process
  }

  const sizeKb = fs.statSync(file).size / 1024;
  const hasTransparency = meta.hasAlpha === true || meta.channels === 4;

  if (hasTransparency && meta.format !== "webp" && sizeKb > ALPHA_MIN_KB) {
    const out = file.replace(/\.[^.]+$/, ".webp");
    await sharp(file)
      .webp({ quality: 80, effort: 6 })
      .toFile(out + ".tmp");
    fs.renameSync(out + ".tmp", out);
    if (out !== file) fs.unlinkSync(file);
    savedKb += sizeKb - fs.statSync(out).size / 1024;
    renames.push([path.basename(file), path.basename(out)]);
  } else if (!hasTransparency && meta.format === "jpeg" && sizeKb > JPEG_MIN_KB) {
    const buf = await sharp(file)
      .jpeg({ quality: 74, mozjpeg: true, progressive: true })
      .toBuffer();
    await fs.promises.writeFile(file, buf);
    savedKb += sizeKb - buf.length / 1024;
  }
}

console.log(`optimized; saved ~${Math.round(savedKb)} KB`);
if (renames.length) {
  console.log("renamed (update source references):");
  for (const [from, to] of renames) console.log(`  ${from} -> ${to}`);
}
