// A minimal PNG reader for the film's tests: 8-bit RGB or RGBA, non-interlaced, through node:zlib.
// Enough to read the screenshots the film takes its figures from; no dependency.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

/** @param {string} file @returns {{ width: number, height: number, rgb: (x: number, y: number) => [number, number, number] }} */
export function readPng(file) {
  const buf = readFileSync(file);
  let pos = 8;
  let width = 0, height = 0, colorType = 0, bitDepth = 0, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6) || interlace !== 0) {
    throw new Error(`unsupported PNG: depth ${bitDepth}, color type ${colorType}, interlace ${interlace}`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      const v = line[x];
      const out = filter === 0 ? v : filter === 1 ? v + a : filter === 2 ? v + b : filter === 3 ? v + ((a + b) >> 1) : v + paeth;
      px[y * stride + x] = out & 255;
    }
  }
  return {
    width,
    height,
    rgb: (x, y) => {
      const i = y * stride + x * bpp;
      return [px[i], px[i + 1], px[i + 2]];
    },
  };
}
