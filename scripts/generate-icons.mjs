import sharp from "sharp";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function svgIcon(size) {
  const fontSize = Math.round(size * 0.36);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#171717"/>
  <text x="50%" y="54%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700"
        fill="#ffffff" text-anchor="middle" dominant-baseline="middle">AI</text>
</svg>`;
}

async function main() {
  for (const size of [192, 512]) {
    const svg = Buffer.from(svgIcon(size));
    await sharp(svg).png().toFile(join(outDir, `icon-${size}.png`));
    console.log(`generated icon-${size}.png`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
