#!/usr/bin/env node
// Downloads the Material Symbols icon font into public/fonts/ so the site never
// calls fonts.googleapis.com or fonts.gstatic.com at runtime — a visitor's IP
// reached Google on every page load while the font was linked remotely.
//
// The font is requested as a subset containing only the icons below. The full
// variable font is ~1.1 MB; these seven glyphs are ~2.3 KB.
//
// IMPORTANT: adding a new `material-symbols-outlined` icon to the app means
// adding its name here and re-running this script, otherwise it renders as
// blank space. Keep this list sorted and in sync with the components.
//
// Run with: node scripts/fetch-icon-font.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ICONS = [
  "close",
  "download",
  "menu",
  "photo_camera",
  "progress_activity",
  "share",
  "slideshow",
];

// Google serves woff2 only to browser-like clients.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const cssUrl =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" +
  `&icon_names=${ICONS.join(",")}&display=block`;

const cssResponse = await fetch(cssUrl, { headers: { "User-Agent": UA } });
if (!cssResponse.ok) {
  throw new Error(`Failed to fetch icon font CSS: ${cssResponse.status}`);
}
const css = await cssResponse.text();

const fontUrl = css.match(/https:\/\/fonts\.gstatic\.com[^)]+/)?.[0];
if (!fontUrl) {
  throw new Error("No gstatic font URL found in the returned CSS");
}

const fontResponse = await fetch(fontUrl, { headers: { "User-Agent": UA } });
if (!fontResponse.ok) {
  throw new Error(`Failed to fetch icon font: ${fontResponse.status}`);
}
const font = Buffer.from(await fontResponse.arrayBuffer());

const outDir = path.join(process.cwd(), "public", "fonts");
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "material-symbols-outlined.woff2"), font);

console.log(
  `material-symbols-outlined.woff2: ${(font.length / 1024).toFixed(1)} KB ` +
    `(${ICONS.length} icons)`
);
