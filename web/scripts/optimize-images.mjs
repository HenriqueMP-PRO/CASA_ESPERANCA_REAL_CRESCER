// Generates responsive WebP variants for public/images/*.jpeg and a manifest
// consumed by src/lib/images.ts. Run after adding or replacing photos:
//   npm run images
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const imagesDir = path.join(root, "public/images");
const manifestPath = path.join(root, "src/content/image-variants.json");
const WIDTHS = [480, 960, 1600];

const files = (await readdir(imagesDir)).filter((f) => /\.jpe?g$/i.test(f)).sort();
const manifest = {};

for (const file of files) {
  const input = path.join(imagesDir, file);
  const { width } = await sharp(input).metadata();
  const widths = WIDTHS.filter((w) => w < width);
  // Keep the original size when it is meaningfully larger than the last step.
  if (width < WIDTHS.at(-1) && (widths.length === 0 || widths.at(-1) < width * 0.85)) {
    widths.push(width);
  }

  const base = file.replace(/\.jpe?g$/i, "");
  manifest[`/images/${file}`] = [];
  for (const w of widths) {
    const name = `${base}-${w}.webp`;
    await sharp(input).rotate().resize({ width: w }).webp({ quality: 76 }).toFile(path.join(imagesDir, name));
    manifest[`/images/${file}`].push({ w, src: `/images/${name}` });
  }
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated variants for ${files.length} images`);
