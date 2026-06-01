// Generates a 512x512 source PNG for the app icon: a minimalist grid motif
// on near-black, with a warm-gold "current month" cell. Zero dependencies —
// emits a valid 8-bit RGBA PNG using Node's built-in zlib.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const S = 512;
const buf = Buffer.alloc(S * S * 4);

const bg = [8, 9, 10];
const cell = [44, 47, 51];
const gold = [201, 178, 125];

function set(x, y, [r, g, b]) {
  const i = (y * S + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
}

// fill bg
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) set(x, y, bg);

// 10x10 grid of rounded squares, centered with margin
const N = 10;
const margin = 56;
const span = S - margin * 2;
const gap = 6;
const sz = (span - gap * (N - 1)) / N;
const goldCell = 37; // which cell index is "now"

for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    const idx = r * N + c;
    const color = idx === goldCell ? gold : cell;
    const ox = Math.round(margin + c * (sz + gap));
    const oy = Math.round(margin + r * (sz + gap));
    for (let dy = 0; dy < sz; dy++) {
      for (let dx = 0; dx < sz; dx++) {
        set(ox + dx, oy + dy, color);
      }
    }
  }
}

// PNG encode
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8;   // bit depth
ihdr[9] = 6;   // color type RGBA
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

// raw scanlines with filter byte 0
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}
const idat = deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  sig,
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync(new URL("./app-icon.png", import.meta.url), png);
console.log("wrote app-icon.png", png.length, "bytes");
