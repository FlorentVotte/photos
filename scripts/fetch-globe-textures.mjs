#!/usr/bin/env node
// Fetches the NASA Blue Marble textures used by the 3D globe and stores them
// under public/globe/, downscaled to 2048x1024 — plenty for a globe that never
// zooms in, and a fraction of the download of the originals.
//
// Run with: node scripts/fetch-globe-textures.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCES = [
  {
    url: "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg",
    file: "earth-blue-marble.jpg",
    encode: (img) => img.jpeg({ quality: 82, mozjpeg: true }),
  },
  {
    url: "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png",
    file: "earth-topology.png",
    // Palette-encoded: the source is an 8-bit grayscale bump map, so 256 levels
    // are lossless in practice and roughly halve the file.
    encode: (img) => img.png({ compressionLevel: 9, palette: true }),
  },
];

const outDir = path.join(process.cwd(), "public", "globe");
await mkdir(outDir, { recursive: true });

for (const { url, file, encode } of SOURCES) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const source = Buffer.from(await response.arrayBuffer());
  const output = await encode(
    sharp(source).resize(2048, 1024, { fit: "fill" })
  ).toBuffer();
  await writeFile(path.join(outDir, file), output);
  console.log(`${file}: ${(output.length / 1024).toFixed(0)} KB`);
}
