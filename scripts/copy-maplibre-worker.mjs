#!/usr/bin/env node
// Copies maplibre-gl's worker into public/ so the app can serve it.
//
// maplibre-gl 6 loads its worker from a file next to its own module
// (new URL("./maplibre-gl-worker.mjs", import.meta.url)). Once Next bundles
// the library that sibling no longer exists, so BasemapLayer points maplibre
// at /maplibre-gl-worker.mjs instead. Copying it on every dev and build keeps
// the worker on the same version as the main-thread code; the copy is
// gitignored.
//
// Runs automatically as the predev and prebuild npm scripts.
import { copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const source = require.resolve("maplibre-gl/dist/maplibre-gl-worker.mjs");
const target = path.join(process.cwd(), "public", "maplibre-gl-worker.mjs");

await copyFile(source, target);
