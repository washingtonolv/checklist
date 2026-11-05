// Gera os arquivos PNG da marca a partir dos SVGs oficiais.
// Substitua public/brand/logo-dd.svg pela logo oficial, se desejar,
// e execute: npm run logo
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const brandDir = path.join(root, "public", "brand");
await mkdir(brandDir, { recursive: true });

const logoSvg = path.join(brandDir, "logo-dd.svg");
const markSvg = path.join(brandDir, "logo-dd-mark.svg");

await sharp(logoSvg).resize({ width: 1200 }).png().toFile(path.join(brandDir, "logo-dd.png"));
await sharp(logoSvg).resize({ width: 480 }).png().toFile(path.join(brandDir, "logo-dd-small.png"));
await sharp(markSvg).resize({ width: 512 }).png().toFile(path.join(brandDir, "logo-dd-mark.png"));
await sharp(markSvg).resize({ width: 64 }).png().toFile(path.join(root, "src", "app", "icon.png"));

console.log("Logo PNG gerada em public/brand e src/app/icon.png");

