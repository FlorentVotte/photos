import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), ...path.split("/")), "utf8");

// maplibre-gl 6 resolves its worker as a sibling of its own module file. Once
// bundled, that sibling does not exist, the worker fails to load and every
// Leaflet map renders without a basemap.
describe("maplibre worker wiring", () => {
  it("points maplibre at the served worker before the layer is created", () => {
    const basemap = read("src/components/BasemapLayer.tsx");
    expect(basemap).toMatch(
      /setWorkerUrl\(`\/maplibre-gl-worker\.mjs\?v=\$\{maplibre\.getVersion\(\)\}`\)[\s\S]*maplibreGL\(/
    );
  });

  it("copies the worker into public/ before dev and build", () => {
    const { scripts } = JSON.parse(read("package.json"));
    expect(scripts.predev).toBe("node scripts/copy-maplibre-worker.mjs");
    expect(scripts.prebuild).toBe("node scripts/copy-maplibre-worker.mjs");
    expect(read("scripts/copy-maplibre-worker.mjs")).toContain(
      "maplibre-gl/dist/maplibre-gl-worker.mjs"
    );
  });

  it("keeps the generated copy out of git", () => {
    expect(read(".gitignore")).toMatch(/^public\/maplibre-gl-worker\.mjs$/m);
  });
});
