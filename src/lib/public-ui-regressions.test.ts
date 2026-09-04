import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(join(process.cwd(), "src", ...path.split("/")), "utf8");

describe("public UI regressions", () => {
  it("keeps the homepage main landmark in the flex height chain", () => {
    expect(source("app/page.tsx")).toMatch(
      /<main className="[^"]*flex[^"]*flex-1[^"]*flex-col[^"]*">/
    );
  });

  it("localizes the map route loading label", () => {
    const loadingSource = source("app/map/loading.tsx");
    expect(loadingSource).not.toContain("Loading map");
    expect(loadingSource).toContain('t("map", "loadingMap"');
  });

  it("removes chapter map markers from the keyboard tab order", () => {
    expect(source("components/ChapterRouteMap.tsx")).toMatch(
      /<Marker[\s\S]*?keyboard=\{false\}/
    );
  });
});
