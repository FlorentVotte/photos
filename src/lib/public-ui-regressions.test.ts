import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(join(process.cwd(), "src", ...path.split("/")), "utf8");

describe("public UI regressions", () => {
  it("keeps the homepage main landmark in the flex height chain", () => {
    expect(source("app/page.tsx")).toMatch(
      /<main[^>]*className="[^"]*flex[^"]*flex-1[^"]*flex-col[^"]*"/
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

  it("gives every public page a skip target and the header a skip link", () => {
    const header = source("components/Header.tsx");
    expect(header).toContain('href="#main"');
    expect(header).toContain('t("nav", "skipToContent")');
    for (const file of [
      "app/page.tsx",
      "app/login/page.tsx",
      "components/PhotoContent.tsx",
      "components/AlbumContent.tsx",
      "components/AlbumsContent.tsx",
      "components/AboutContent.tsx",
      "components/MapContent.tsx",
      "components/LegalContent.tsx",
      "components/PrivacyContent.tsx",
      "app/search/SearchClient.tsx",
    ]) {
      expect(source(file), file).toMatch(/<main[^>]*id="main"[^>]*tabIndex=\{-1\}/);
    }
  });

  it("keeps the wordmark out of the heading outline and names the link", () => {
    const header = source("components/Header.tsx");
    expect(header).not.toContain("<h2");
    expect(header).toContain('aria-label={t("nav", "homeLink")}');
  });

  it("exposes navigation semantics", () => {
    const header = source("components/Header.tsx");
    expect(header).toContain('aria-current={active ? "page" : undefined}');
    expect(header).toContain('aria-label={t("nav", "menu")}');
    expect(header).toContain("aria-controls={mobileMenuId}");
    expect(header).toContain("aria-expanded={mobileMenuOpen}");
    expect(source("components/Footer.tsx")).toContain('t("footer", "legalNav")');
  });

  it("announces share results and labels the login error", () => {
    const photo = source("components/PhotoContent.tsx");
    expect(photo).toContain('role="status"');
    expect(photo).toContain('t("photo", "copyFailed")');
    const login = source("app/login/page.tsx");
    expect(login).toContain('role="alert"');
    expect(login).toContain("aria-describedby");
    expect(login).toContain("aria-invalid");
  });

  it("uses a heading for the chapterless gallery and a safe chapter cover alt", () => {
    const album = source("components/AlbumContent.tsx");
    expect(album).toMatch(/<h2[^>]*>\s*\{t\("album", "gallery"\)\}/);
    expect(album).toContain("formatPhotoAccessibleLabel(");
    expect(album).not.toContain("alt={coverPhoto.title}");
  });

  it("wires admin chapter labels to their fields", () => {
    const chapters = source("app/admin/chapters/page.tsx");
    expect(chapters).toContain("htmlFor={`chapter-${chapter.id}-title-en`}");
    expect(chapters).toContain("id={`chapter-${chapter.id}-title-fr`}");
  });
});
