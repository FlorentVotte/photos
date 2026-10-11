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
    // Catch-all only caches same-origin, non-RSC responses, via waitUntil.
    expect(sw).toContain("url.origin === self.location.origin");
    expect(sw).toContain('url.searchParams.has("_rsc")');
    expect(sw).toContain('request.headers.get("RSC")');
    expect(sw).toContain("event.waitUntil(");
  });

  it("keeps the home globe light, pausable and keyboard-safe", () => {
    const hero = source("components/GlobeHero.tsx");
    expect(hero).toContain("/globe/earth-topology.jpg");
    expect(hero).toContain('"(pointer: coarse)"');
    expect(hero).toContain("reduceQuery.addEventListener");
    expect(hero).toContain("button.tabIndex = facing ? 0 : -1");
    expect(hero).toContain('setAttribute("aria-hidden", "true")');
    expect(hero).not.toContain("camera.position.clone()");

    const section = source("components/GlobeHeroSection.tsx");
    expect(section).toContain("{globeReady && (");
    expect(section).toContain("aria-pressed={paused}");
    expect(section).toContain("min-h-11");
    expect(section).toContain("font-sans text-label uppercase text-text-muted");
    expect(section).toContain('t("home", "globePause")');
    expect(section).toContain("!reduceMotion && (");
  });

  it("keeps map surfaces touch-safe, keyboard-reachable and on-theme", () => {
    const globe = source("components/Globe3D.tsx");
    expect(globe).toContain("globeTouchConfig(");
    // OrbitControls connects to one stable element (the canvas), and the touch
    // config is applied to the element the controls actually connected to.
    expect(globe).toContain("domElement={gl.domElement}");
    expect(globe).toContain("const target = controls.domElement;");
    expect(globe).toContain("applyGlobeTouch(target, controls, camera, touch)");
    expect(globe).not.toContain("applyGlobeTouch(gl.domElement");
    for (const hex of ["#ef4444", "#f97316", "#88ccff", "#4da6ff", "#4a9eff"]) {
      expect(globe).not.toContain(hex);
    }
    const photoGlobe = source("components/PhotoGlobe.tsx");
    expect(photoGlobe).toContain("albumsOnGlobeHeading");
    expect(photoGlobe).toContain("href={`/album/${marker.slug}`}");
    expect(source("components/ChapterRouteMap.tsx")).not.toContain("#7ba88e");
    for (const f of ["components/PhotoMap.tsx", "components/ChapterRouteMap.tsx"]) {
      const text = source(f);
      expect(text, f).toContain("iconSize: [44, 44]");
      expect(text, f).toContain("iconAnchor: [22, 22]");
    }
    expect(source("components/PhotoMap.tsx")).toContain(
      "h-[60svh] min-h-[360px] md:h-[600px]",
    );
    const css = source("app/globals.css");
    expect(css).toMatch(/\.leaflet-bar a,[\s\S]*?width: 44px;[\s\S]*?height: 44px;/);
  });

  it("sizes type in rem, not px, so it follows the reader's text setting", () => {
    for (const f of [
      "components/GlobeHeroSection.tsx",
      "components/PhotoGlobe.tsx",
      "components/BasemapAttribution.tsx",
      "components/ChapterRouteMap.tsx",
      "components/ChapterStats.tsx",
    ]) {
      expect(source(f), f).not.toMatch(/text-\[[\d.]+px\]/);
    }
    expect(source("components/ChapterRouteMap.tsx")).not.toContain("text-[0.5rem]");
    const css = source("app/globals.css");
    const label = css.match(/\.globe-hero-label\s*\{[^}]*\}/)?.[0] ?? "";
    expect(label).not.toBe("");
    expect(label).not.toMatch(/font-size:\s*[\d.]+px/);
  });

  it("lets photo grid rows grow with their captions", () => {
    const grid = source("components/PhotoGrid.tsx");
    expect(grid).toContain("auto-rows-[minmax(300px,auto)]");
    expect(grid).toContain("auto-rows-[minmax(250px,auto)]");
  });
});

describe("mobile safe areas, viewport units and touch targets", () => {
  it("respects safe areas", () => {
    expect(source("app/layout.tsx")).toContain('viewportFit: "cover"');
    const header = source("components/Header.tsx");
    expect(header).toContain("pt-[max(0.75rem,env(safe-area-inset-top))]");
    expect(header).toContain("pl-[max(1rem,env(safe-area-inset-left))]");
    expect(header).toContain("right-[max(0.75rem,env(safe-area-inset-right))]");
    expect(header).toContain("focus:top-[max(0.5rem,env(safe-area-inset-top))]");
  });

  it("lets the mobile menu scroll in landscape without clipping", () => {
    const header = source("components/Header.tsx");
    expect(header).toContain("justify-start overflow-y-auto");
    expect(header).toContain("my-auto flex flex-col");
    expect(header).not.toContain("items-start justify-center gap-8 px-8");
  });

  it("uses small-viewport units for tall surfaces", () => {
    for (const f of [
      "components/AlbumContent.tsx",
      "app/album/[slug]/loading.tsx",
    ]) {
      expect(source(f), f).toContain("h-[75svh]");
      expect(source(f), f).toContain("md:h-[88svh]");
    }
    expect(source("components/PhotoContent.tsx")).toContain(
      "h-[60svh] sm:h-[70svh] md:h-[78svh]",
    );
    expect(source("app/loading.tsx")).toContain("min-h-[70svh]");
    expect(source("app/loading.tsx")).toContain("min-h-svh");
  });

  it("gives interactive text at least a 44px hit area", () => {
    const search = source("app/search/SearchClient.tsx");
    expect(search).toContain("inline-flex min-h-11 items-center px-2");
    expect(search).toContain("after:bottom-1");
    expect(search).toContain('className="min-h-11 rounded-full');
    expect(source("components/Footer.tsx")).toContain(
      "inline-flex min-h-11 items-center",
    );
    const header = source("components/Header.tsx");
    expect(header.match(/inline-flex min-h-11 items-center/g)?.length).toBe(3);
    const photo = source("components/PhotoContent.tsx");
    expect(photo).toContain("inline-flex size-11 items-center justify-center");
    expect(photo).not.toContain("text-white/60");
    expect(photo.match(/inline-flex min-h-11 items-center gap-2/g)?.length).toBe(3);
  });
});

describe("motion is driven by transforms and honours reduced motion", () => {
  it("drives the album hero parallax without per-scroll React state", () => {
    const album = source("components/AlbumContent.tsx");
    expect(album).not.toContain("setScrollY");
    expect(album).not.toContain("will-change-transform");
    expect(album).toContain("heroParallax(");
    expect(album).toContain("requestAnimationFrame");
    expect(album).toContain("IntersectionObserver");
    expect(album).toContain("prefers-reduced-motion: reduce");
  });

  it("scales hairlines instead of animating their width", () => {
    for (const file of [
      "components/AlbumContent.tsx",
      "components/HomeContent.tsx",
      "components/PhotoContent.tsx",
    ]) {
      const src = source(file);
      expect(src).not.toMatch(/transition-all duration-300 group(\/cta)?-hover:w-/);
      expect(src).toMatch(/origin-(left|right) scale-x-\[/);
      expect(src).toContain("ease-out-soft");
    }
  });

  it("reveals the gh-rule with scaleX and the globe list rows with translate", () => {
    const css = source("app/globals.css");
    expect(css).toMatch(/\.gh-rule \{\s*width: 56px;\s*transform: scaleX\(0\);/);
    expect(css).not.toMatch(/transition: width 900ms/);
    const globe = source("components/GlobeHeroSection.tsx");
    expect(globe).not.toContain("padding-left");
    expect(globe).not.toContain("pl-2.5");
    expect(globe).toContain("translate-x-2.5");
  });

  it("carries the active theme to browser chrome, manifest and share images", () => {
    const layout = source("app/layout.tsx");
    expect(layout).toContain("themeColor: getThemeMetaColor(theme)");
    expect(layout).toContain("colorScheme: mode");
    expect(layout).not.toContain('className="dark"');
    const manifest = source("app/manifest.ts");
    expect(manifest).toContain("getActiveTheme");
    expect(manifest).not.toMatch(/#[0-9a-fA-F]{6}/);
    for (const route of ["app/api/og/route.tsx", "app/api/og/album/[slug]/route.tsx"]) {
      const og = source(route);
      expect(og).toContain("getActiveTheme");
      expect(og).not.toContain("#c9a227");
      expect(og).not.toContain("#0d0d0d");
    }
  });

  it("picks the basemap style by theme mode", () => {
    const basemap = source("components/BasemapLayer.tsx");
    expect(basemap).toContain("styles/positron");
    expect(basemap).toContain("THEME_PRESETS[theme]");
  });

  it("keeps photographs square and drops dead typography and focus radius", () => {
    expect(source("components/PhotoGrid.tsx")).not.toContain("overflow-hidden rounded-lg");
    expect(source("components/PhotoGrid.tsx")).toContain("font-display font-semibold tracking-tight");
    expect(source("components/PhotoLocationMap.tsx")).not.toContain("rounded-lg");
    expect(source("components/LegalContent.tsx")).not.toContain("prose");
    expect(source("components/PrivacyContent.tsx")).not.toContain("prose");
    expect(source("app/globals.css")).not.toMatch(/:focus-visible \{[^}]*border-radius/);
  });

  it("lets long mapped-photo titles truncate instead of widening the page", () => {
    const map = source("components/PhotoMap.tsx");
    expect(map).toContain("grid grid-cols-1 gap-2");
    expect(map).toContain('<li key={photo.id} className="min-w-0">');
  });

  it("defines the font variables where the theme's :root block resolves them", () => {
    const layout = source("app/layout.tsx");
    expect(layout).toMatch(/<html[^>]*className=\{fontVariableClasses\}/);
    expect(layout).not.toMatch(/<body\s+className=\{`\$\{fontVariableClasses/);
  });

  it("keeps service-worker cache writes alive with waitUntil", () => {
    const sw = readFileSync(join(process.cwd(), "public", "sw.js"), "utf8");
    expect(sw).toContain("function cacheFirst(event, cacheName, afterPut)");
    // No fire-and-forget writes: every cache.put sits inside a waitUntil.
    expect(sw).not.toMatch(/\n\s{6,}caches\.open\([a-zA-Z_]+\)\.then\(/);
    expect(sw.match(/event\.waitUntil\(/g)?.length).toBeGreaterThanOrEqual(5);
  });
});
