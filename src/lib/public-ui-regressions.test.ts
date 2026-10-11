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

  it("keeps small muted text and placeholders at AA contrast", () => {
    const weak = /text-text-muted\/(40|50|60|70|75)|placeholder-text-muted\/(40|50|60|70)/;
    for (const f of [
      "app/search/SearchClient.tsx",
      "components/PhotoMap.tsx",
      "components/PhotoGlobe.tsx",
      "components/ChapterStats.tsx",
      "components/BasemapAttribution.tsx",
      "components/GlobeHeroSection.tsx",
      "app/login/page.tsx",
      "app/admin/albums/page.tsx",
      "app/admin/chapters/page.tsx",
      "components/admin/GalleryForm.tsx",
    ]) {
      const text = source(f).replace(/<span[^>]*text-text-muted\/40[^>]*>/g, "");
      expect(text, f).not.toMatch(weak);
    }
    expect(source("components/HomeContent.tsx")).not.toContain("text-foreground/50");
  });

  it("reveals photo-page arrows on keyboard focus", () => {
    const photo = source("components/PhotoContent.tsx");
    expect(photo.match(/focus-visible:opacity-100/g)).toHaveLength(2);
    expect(photo).not.toContain("text-white/40 opacity-0");
  });

  it("puts text over photos on a strong scrim", () => {
    expect(source("components/AlbumContent.tsx")).toContain(
      "from-background-dark/80 via-background-dark/50 to-transparent"
    );
    const grid = source("components/PhotoGrid.tsx");
    expect(grid).toContain("from-black/80 via-black/25 to-transparent");
    expect(grid).not.toContain("to-transparent opacity-60");
    expect(grid).toContain("text-white/80");
  });

  it("gives underline-only inputs a 3:1 boundary", () => {
    for (const f of [
      "app/search/SearchClient.tsx",
      "app/login/page.tsx",
      "app/admin/albums/page.tsx",
      "app/admin/chapters/page.tsx",
      "components/admin/GalleryForm.tsx",
    ]) {
      expect(source(f), f).not.toMatch(/border-b border-surface-border bg-transparent/);
      expect(source(f), f).toContain("border-b border-text-muted/60 bg-transparent");
    }
  });

  it("keeps the lightbox keyboard-, screen-reader- and touch-safe", () => {
    const lightbox = source("components/Lightbox.tsx");
    expect(lightbox).toContain('role="status"');
    expect(lightbox).toContain('aria-live={isPlaying ? "off" : "polite"}');
    expect(lightbox).toContain('t("lightbox", "loading")');
    expect(lightbox).toContain("formatPhotoAccessibleLabel");
    expect(lightbox).toContain("onTouchCancel={handleTouchCancel}");
    expect(lightbox).not.toMatch(/aria-label=\{(isPlaying|t\("lightbox", "(close|viewDetails)")/);
    expect(lightbox).not.toContain("85vh");
    expect(lightbox).not.toContain("text-white/40");
    expect(lightbox).toContain("max-h-[85dvh]");
    expect(lightbox).toContain("[@media(max-height:500px)]:max-h-[72dvh]");
    expect(lightbox).toContain("env(safe-area-inset-top)");
    expect(lightbox).toContain("env(safe-area-inset-bottom)");

    const keyboard = source("hooks/useLightboxKeyboard.ts");
    expect(keyboard).toContain("isInteractiveTarget(e.target)");
    expect(keyboard).not.toMatch(/handleKeyDown = [^]*?\n\s*e\.stopImmediatePropagation\(\);\n\n\s*switch/);
  });

  it("serves album covers as responsive lazy images, not CSS backgrounds", () => {
    for (const f of ["components/AlbumCard.tsx", "components/AlbumContent.tsx", "app/search/SearchClient.tsx"]) {
      expect(source(f), f).not.toContain("backgroundImage");
      expect(source(f), f).toContain("<ProtectedImage");
    }
    const content = source("components/AlbumContent.tsx");
    expect(content).toContain('loading="eager"');
    expect(content).toContain('fetchPriority="high"');
  });

  it("loads the lightbox lazily and uses the medium fallback src", () => {
    const photo = source("components/PhotoContent.tsx");
    expect(photo).not.toContain('import Lightbox from');
    expect(photo).toContain("ssr: false");
    expect(photo).toContain("lightboxRequested &&");
    expect(photo).toContain("src={photo.src.medium}");
  });

  it("preloads only the Noto font pair", () => {
    const layout = source("app/layout.tsx");
    expect(layout.match(/preload: false/g)).toHaveLength(7);
  });

  it("keeps the service worker from precaching pages", () => {
    const sw = readFileSync(join(process.cwd(), "public", "sw.js"), "utf8");
    expect(sw).not.toMatch(/"\/(albums|search|map|about)"/);
    expect(sw).toContain("/_next/static/");
    expect(sw).toContain("MAX_IMAGE_ENTRIES");
  });
});
