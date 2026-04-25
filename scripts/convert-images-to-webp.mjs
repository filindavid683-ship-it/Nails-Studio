import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const htmlPath = path.join(projectRoot, "index.html");
const outputDir = path.join(projectRoot, "assets", "images");

const IMAGE_MAP = [
  ["https://i.ibb.co/k2gRWDP7/06.jpg", "assets/images/works-01.webp"],
  ["https://i.ibb.co/3Vz2HyH/90.jpg", "assets/images/works-02.webp"],
  ["https://i.ibb.co/dsFMSJgh/07.jpg", "assets/images/works-03.webp"],
  ["https://i.ibb.co/bjGbY7K3/80.jpg", "assets/images/works-04.webp"],
  ["https://i.ibb.co/0yT7Czq4/09.jpg", "assets/images/works-05.webp"],
  ["https://i.ibb.co/W4VH8Lw5/21.png", "assets/images/works-06.webp"],
  ["https://i.ibb.co/mFBKZrzL/22.png", "assets/images/works-07.webp"],
  ["https://i.ibb.co/FkLQbmvb/23.png", "assets/images/works-08.webp"],
  ["https://i.ibb.co/WvqM0tB6/24.png", "assets/images/works-09.webp"],
  ["https://i.ibb.co/N2JbTzJM/25.png", "assets/images/works-10.webp"],
  ["https://i.ibb.co/MD2zGJzM/34.png", "assets/images/studio.webp"],
  ["https://i.ibb.co/WvzRmQr1/31.png", "assets/images/feature-01.webp"],
  ["https://i.ibb.co/LDfggpYd/32.png", "assets/images/feature-02.webp"],
  ["https://i.ibb.co/7txCcjLD/33.png", "assets/images/feature-03.webp"],
  ["https://i.ibb.co/TBBV9tqY/42.png", "assets/images/review-01.webp"],
  ["https://s10.iimage.su/s/25/gWYZsqRxz70S8piXQpr15KIk7oiX6p0XoRYU3izOw.jpg", "assets/images/review-02.webp"],
  ["https://s10.iimage.su/s/25/gwRptyqxsjRLz2PLSlaIL0QGfZiiYpTDizsqAqskF.jpg", "assets/images/review-04.webp"],
  ["https://s10.iimage.su/s/25/geAVf8oxoBtbOVYst56Uiw2gbT7kugEaYROKcSbcu.png", "assets/images/review-06.webp"],
];

async function downloadToBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function convertImages() {
  await ensureDir(outputDir);

  for (const [sourceUrl, localRelativePath] of IMAGE_MAP) {
    const targetPath = path.join(projectRoot, localRelativePath);
    const buffer = await downloadToBuffer(sourceUrl);

    await sharp(buffer)
      .rotate()
      .webp({ quality: 84, effort: 5 })
      .toFile(targetPath);

    console.log(`Converted: ${sourceUrl} -> ${localRelativePath}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function rewriteHtmlSources() {
  let html = await fs.readFile(htmlPath, "utf8");

  for (const [sourceUrl, localRelativePath] of IMAGE_MAP) {
    const rx = new RegExp(escapeRegExp(sourceUrl), "g");
    html = html.replace(rx, localRelativePath);
  }

  await fs.writeFile(htmlPath, html, "utf8");
  console.log("Updated image URLs in index.html");
}

await convertImages();
await rewriteHtmlSources();
