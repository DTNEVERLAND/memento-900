// Generates NSIS installer artwork as 24-bit BMP (the format NSIS requires):
//   - header.bmp   150 x 57   (top banner on inner pages)
//   - sidebar.bmp  164 x 314  (welcome / finish page left panel)
// Memento 900 aesthetic: near-black ground, faint month-grid, one gold cell.
import { writeFileSync } from "node:fs";

const BG = [10, 9, 8]; // BGR order in BMP
const CELL = [51, 47, 44];
const GOLD = [125, 178, 201];
const FAINT = [26, 24, 22];

function makeCanvas(w, h) {
  const px = Array.from({ length: h }, () => Array.from({ length: w }, () => [...BG]));
  return { w, h, px };
}
function rect(c, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x >= 0 && x < c.w && y >= 0 && y < c.h) c.px[y][x] = [...color];
    }
  }
}

/** Draw an N-wide grid of squares within a box, with one gold cell. */
function grid(c, x0, y0, boxW, boxH, n, goldIdx) {
  const gap = 2;
  const sz = Math.floor((Math.min(boxW, boxH) - gap * (n - 1)) / n);
  const used = sz * n + gap * (n - 1);
  const sx = x0 + Math.floor((boxW - used) / 2);
  const sy = y0 + Math.floor((boxH - used) / 2);
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const idx = r * n + col;
      const color = idx === goldIdx ? GOLD : idx < goldIdx ? CELL : FAINT;
      rect(c, sx + col * (sz + gap), sy + r * (sz + gap), sz, sz, color);
    }
  }
}

function encodeBMP(c) {
  const rowSize = Math.ceil((c.w * 3) / 4) * 4;
  const pixelArraySize = rowSize * c.h;
  const fileSize = 54 + pixelArraySize;
  const buf = Buffer.alloc(fileSize);
  // BITMAPFILEHEADER
  buf.write("BM", 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(54, 10); // pixel data offset
  // BITMAPINFOHEADER
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(c.w, 18);
  buf.writeInt32LE(c.h, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0, 30);
  buf.writeUInt32LE(pixelArraySize, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  // pixel data, bottom-up
  let off = 54;
  for (let y = c.h - 1; y >= 0; y--) {
    for (let x = 0; x < c.w; x++) {
      const [b, g, r] = c.px[y][x];
      buf[off++] = b;
      buf[off++] = g;
      buf[off++] = r;
    }
    while ((off - 54) % rowSize !== 0) buf[off++] = 0;
  }
  return buf;
}

// Header banner 150x57 — small grid on the right, dark field on the left for title text
const header = makeCanvas(150, 57);
grid(header, 100, 4, 46, 49, 4, 5);
writeFileSync(new URL("./installer/header.bmp", import.meta.url), encodeBMP(header));

// Sidebar 164x314 — large centered grid, gold cell in the lower-middle
const side = makeCanvas(164, 314);
grid(side, 14, 40, 136, 200, 6, 21);
writeFileSync(new URL("./installer/sidebar.bmp", import.meta.url), encodeBMP(side));

console.log("wrote installer/header.bmp and installer/sidebar.bmp");
