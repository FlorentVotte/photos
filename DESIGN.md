---
name: Regards Perdus
description: A travel notebook read after dark; photographs, routes and narrative on deep harbour ink.
colors:
  primary: "#6c9bb5"
  background: "#0f1a23"
  surface: "#162330"
  surface-border: "#22354a"
  text-primary: "#f3f4f5"
  text-muted: "#9aabbb"
typography:
  display:
    fontFamily: "Noto Serif, serif"
    fontSize: "6rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  display-home:
    fontFamily: "Noto Serif, serif"
    fontSize: "4.75rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  quote:
    fontFamily: "Noto Serif, serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Noto Serif, serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Noto Serif, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  lede:
    fontFamily: "Noto Serif, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  lede-home:
    fontFamily: "Noto Serif, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  nav:
    fontFamily: "Noto Serif, serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  narrative:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 2
  eyebrow:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.32em"
  label:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.24em"
  list:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.16em"
  tag:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.22em"
  micro:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.24em"
rounded:
  none: "0px"
  lg: "0.5rem"
  full: "9999px"
spacing:
  grid-gap: "1rem"
  grid-gap-md: "1.5rem"
  card-inset: "1.5rem"
  gutter: "1.5rem"
  gutter-md: "3rem"
  gutter-lg: "4rem"
  section: "5rem"
  section-md: "7rem"
components:
  button-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.625rem 1.25rem"
  button-pill-hover:
    textColor: "{colors.primary}"
  button-hero-cta:
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1.625rem"
    height: "3rem"
  button-hero-cta-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.background}"
  input-search:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.headline}"
    rounded: "{rounded.none}"
    padding: "0 1rem 0.75rem 0"
  nav-link:
    textColor: "{colors.text-primary}"
    typography: "{typography.nav}"
  nav-link-hover:
    textColor: "{colors.primary}"
  filter-tab:
    textColor: "{colors.text-muted}"
    typography: "{typography.eyebrow}"
  filter-tab-active:
    textColor: "{colors.text-primary}"
  album-card:
    textColor: "{colors.text-primary}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "{spacing.card-inset}"
---

# Design System: Regards Perdus

## Overview

**Creative North Star: "The Carnet de Voyage"**

Regards Perdus reads like a travel notebook opened after dark. The page is ink: a near-black harbour navy that every image, scrim and fade settles into. On it, the photographs carry all the light, and the words are set the way a careful diarist writes them: a serif voice for titles, quotes and italic ledes, a drop cap where a chapter's story begins, and small uppercase captions in a tracked sans for the record (place, date, counts, camera settings). A quote stands in as the colophon. The globe and the route maps are the notebook's pasted-in maps.

Density is low and the pace is slow. Sections are separated by generous vertical space (5–7rem) rather than rules or boxes. Photographs go full-bleed or edge-to-edge within their column with square corners, and text sits below them or on a gradient scrim. The chrome is translucent glass that content slides under, and motion is long, soft and decelerating: things rise and settle, they never bounce.

Confirmed rejections: the travel-blog / influencer look (big CTAs, subscribe prompts, affiliate cards), social-feed mechanics (likes, counters, avatars, infinite feeds), SaaS or dashboard chrome (shadowed cards, badges, chip clouds, rounded panels), and the stock portfolio template (centered hero text over a photo, three-column feature rows).

**Key Characteristics:**
- Dark ink ground; photographs are the only bright surfaces.
- Serif for what the author says, tracked uppercase sans for what the camera recorded.
- Square-cornered photographs; only controls are round.
- No drop shadows. Depth comes from scrims, glass chrome and tonal steps.
- Long, soft, decelerating motion, switched off entirely under reduced motion.

## Colors

A cool, low-chroma maritime palette: one weathered slate-blue accent over five tones of ink, deck and fog.

The live site runs the **Ocean Blue** preset, and the values above are its tokens. The code's fallback (`DEFAULT_THEME`, the `:root` block in `src/app/globals.css`, a fresh database) is Forest Sage, so don't read the code defaults as the live palette. Every color reaches components through six CSS variables (`--color-primary`, `--color-background`, `--color-surface`, `--color-surface-border`, `--color-text-primary`, `--color-text-muted`) and two font variables, all injected server-side from `src/lib/themes.ts`. The same active theme also drives what CSS can't reach: the browser theme color and PWA manifest (both the background), the share images under `/api/og`, the map pins and route lines (read from the variables at runtime), the basemap style (`dark`, or `positron` on a light preset) and `color-scheme`. The other presets swap those same eight variables: Forest Sage, Sunset Orange, Midnight Purple, Desert Sand, Editorial Monograph, Brutalist Photojournalist, Warm Print Catalogue (the only light preset) and Modernist Tonal.

### Primary
- **Harbour Slate** (primary): the single accent. It covers focus rings, link and nav hover, hairline rules (the 56px quote rule, the 24px rule before a featured label), the border and inner glow on the album the globe is pointing at, and map markers and route lines.

### Neutral
- **Deep Harbour Ink** (background): the page ground and the end stop of every gradient, scrim and fade. The `.material` glass chrome is this color at 80–92% opacity, and it is the browser and PWA theme color.
- **Chart Table** (surface): one step up from the ground. Used for photo placeholders before load, pill buttons at 40% opacity, and map overlays.
- **Rigging Line** (surface-border): hairline dividers (footer, section rules, globe-hero album list) and the resting border of pill buttons.
- **Sea Salt** (text-primary): titles, body emphasis and active states.
- **Fog** (text-muted): narrative body, captions, eyebrows and inactive tabs (7.5:1 on the ground). Small text uses full Fog; below 24px it never drops under 80% opacity (5.2:1). Fog at 60% (3.5:1) is reserved for control boundaries such as input underlines.

Over photographs, the system uses literal black and white instead of theme variables: card scrims (`black` at 85% → 30% → 0%), lightbox ground (`black` at 97%), the hero CTA (`white` at 40% border, 5% fill), and caption text at `white` 80%. Text over a photograph always sits on at least a 0.62-alpha dark scrim directly behind it, which holds 4.5:1 even on a white sky; the album hero adds a localized ink scrim under its title block for this. These photo overlays stay dark on every preset, including Warm Print Catalogue, because they are about the photograph, not the page.

### Named Rules
**The Ink Ground Rule.** Every gradient, scrim and fade resolves to the page ground (`--color-background`). Nothing ends darker or lighter than Deep Harbour Ink, or a seam shows where the section meets the page.

**The Derived Tone Rule.** A tone the six variables don't define is mixed from them with `color-mix()` (the globe hero's mid-tone is 14% Harbour Slate into the ground), never hardcoded from one preset's hex.

**The Hairline Accent Rule.** Harbour Slate appears as lines, text, rings and markers. It never fills a large area; the widest fill it takes is a 10% hover wash inside a pill.

## Typography

**Display Font:** Noto Serif (with serif)
**Body Font:** Noto Sans (with sans-serif)

**Character:** A literary serif carries the author's voice, and a plain humanist sans carries the record. The body element defaults to the serif, so anything not explicitly set in sans (including desktop nav) speaks in the serif. Other presets swap the pair (EB Garamond + Hanken Grotesk, Anton + Inter, Newsreader + DM Sans, Bodoni Moda + DM Sans) through `--font-display` / `--font-sans`, so components must use the font variables, never a family name. The next/font variables are set on `<html>`, where the theme's `:root` block resolves them; set on `<body>`, the whole stack goes invalid and the page silently falls back to the system sans. Every size is in rem so type follows the reader's browser text setting; never write a font size in px.

### Hierarchy
- **Display** (600, 3rem → 4.5rem at md → 6rem at lg, line-height 1.02, tracking -0.025em): the album hero title, bottom-left over the cover. The home globe hero headline is its sibling, **Display-home**: 3rem → 4.75rem at lg, line-height 1.02, tracking -0.02em, over a 1.0625rem → 1.25rem italic **Lede-home**.
- **Headline** (600, 1.875rem → 2.25rem at md, line-height 1.25, tracking -0.025em): chapter titles, section headings, the about page name (up to 3.75rem), and the "next journey" title (up to 3rem).
- **Title** (600, 1.25rem → 1.5rem at md; 1.875rem → 2.25rem on a large album card, line-height 1.25): album card titles.
- **Lede** (400 *italic*, 1.25rem → 1.5rem at md, line-height 1.375): album subtitles, the album intro quote, the hero tagline. The home quote is the **Quote** role at 2rem.
- **Nav** (500, 0.875rem): desktop header links, in the serif. The mobile menu sets nav items as 1.875rem serif headlines at 85% Sea Salt.
- **Narrative** (400, 1.125rem at md, line-height 2, max 65ch, Fog): chapter story text. The first letter is a floated serif drop cap (3.75rem, 600, Sea Salt).
- **Body** (400, 1rem, line-height 1.625): photo captions, descriptions, legal text.
- **Eyebrow** (0.75rem, tracking 0.32em, uppercase): section and chapter kickers, filter tabs, locale toggle, lightbox controls.
- **Label** (0.75rem, tracking 0.24em, uppercase): footer, card place · date line, metadata. Pills use this size at 0.18em tracking.
- **List** (0.8125rem, tracking 0.16em, uppercase): rows of the hairline album lists beside the home globe and under the `/map` globe.
- **Tag** (500, 0.6875rem, tracking 0.22em, uppercase): globe marker labels, list years and the featured-album label.
- **Micro** (0.625rem, tracking 0.24em, uppercase): the smallest hints (globe hint, album list headers).

### Named Rules
**The Caption Rule.** Anything the camera or the archive recorded (place, date, counts, EXIF, controls) is set in the sans, uppercase, at one of the three named tracking steps: eyebrow, label or micro. Tracking is never set ad hoc. The serif is reserved for what the author says: titles, quotes, ledes, drop caps.

Known drift: pills (0.18em) and card place · date lines (0.22em) still carry hand-set tracking from before the named steps existed. Treat them as outliers, not precedent; List and Tag are the only named exceptions.

**The Wordmark Rule.** "Regards Perdus" is set in uppercase serif at 0.18em tracking, with "Regards" in 600 Sea Salt and "Perdus" in 300 Fog. "Perdus" lifts to Sea Salt on hover.

## Layout

The system has a single centered column with three container widths: **1100px** for reading surfaces (album body, about), **1200px** for the photo page and footer, and **1280px** for the home globe hero. Side gutters are 1.5rem on mobile, 3rem from md, and 4rem for the header and globe hero at lg.

Vertical rhythm is generous and uniform. Album chapters stack at 7rem gaps, and page bodies pad 5rem → 7rem top and bottom. Inside a chapter, the cover, header, route map, narrative and grid sit 2.5rem apart. Photo and album grids use a 1rem gap (1.5rem from md): one column on mobile, two at md, three at lg. Photo-only grids run 2 → 3 → 4 columns on rows of at least 250px (300px for chapter grids) that grow with their captions, and featured photos span larger cells. Grid cells holding truncated text carry `min-w-0` so a long title truncates instead of widening the page.

Photographs lead the composition. The album hero is full-bleed at 75svh (88svh from md, min 480/640px); full-height surfaces use `svh`/`dvh`, never `vh`, so the mobile URL bar doesn't crop them. Chapter covers are full-width at 16:9 (21:9 from md). Album cards are square, with a large featured card spanning two columns at lg. The globe hero is a two-column grid at lg (460px copy | globe) and stacks globe-over-copy below lg, with a gradient fade between them. The photo page splits image and details at lg (1fr | 360px).

Breakpoints are Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). Every interactive element has at least a 44px target (`min-h-11` / `size-11`), text links and map markers included; the hit area grows, the visible text or dot does not. Icon-only buttons on mobile expand to labelled text from sm. The viewport is `viewport-fit=cover`, so fixed and sticky chrome (header, mobile menu, lightbox controls, skip link) pads itself with `max(<base>, env(safe-area-inset-*))`.

### Named Rules
**The Photo Leads Rule.** A photograph is never boxed, bordered or inset in a frame. It runs full-bleed or edge-to-edge within its column, and text sits below it or on a scrim over its lower edge.

## Elevation & Depth

The system has no drop shadows. Depth comes from three things. **Scrims** are bottom-weighted black or ink gradients that seat text on photographs. **Translucent glass chrome** is the sticky header and mobile menu: ink at 80% (`.material`) or 92% (`.material-thick`) with a 20–32px backdrop blur and 180% saturation. **Tonal steps** run from the ground up to Chart Table. When content scrolls under the header, a soft 1.5rem ink gradient fades in beneath it instead of a hard border. Under `prefers-reduced-transparency` or `prefers-contrast: more`, the glass turns solid and the soft edge becomes a defined Rigging Line border.

The only glows are functional. The album card the home globe is pointing at gets a 60px inset Harbour Slate glow at 25%, and card captions carry a faint text shadow (`0 1px 8px` black at 35%) for legibility on bright covers. Map chrome is the one exception. The 3D globe's photo markers and the map's caption overlay on `/map` use the default large shadow (Tailwind `shadow-lg`) to separate them from busy map tiles.

### Named Rules
**The No-Shadow Rule.** Surfaces never lift on drop shadows. A new panel, card or menu gets depth from glass, scrim or a tonal step, never from a `box-shadow`. Only map chrome sitting on map tiles is exempt.

## Shapes

The form language is square prints and round controls. Photographs, album cards, chapter covers, the album hero, the next-journey banner and the search field are square-cornered (0px). Buttons and pills are fully round (9999px), as are map and globe markers. Hairlines (1px, Rigging Line or Harbour Slate) do the work other systems give to boxes and borders.

There are no rounded rectangles in the public site; photo grid tiles and the photo page's mini-map are square like every other photograph and map frame. Leaflet's zoom buttons keep their bar shape but are themed: 44px squares on Chart Table with a Rigging Line hairline and no shadow.

### Named Rules
**The Square Print Rule.** Photographs have square corners. Only controls and markers are round.

## Components

Controls are **refined and restrained**: they read clearly as controls but never compete with a photograph. Today's pills sit at the quiet edge of that. Their resting border (Rigging Line on Deep Harbour Ink) is faint, so refinements should add affordance through border contrast and hover state, never through solid accent fills or shadows.

### Buttons
- **Shape:** fully round pill (9999px).
- **Pill (default action: share, download, slideshow, load more):** Chart Table at 40% behind Sea Salt label text, 1px Rigging Line border, 0.625rem × 1.25rem padding with a 44px minimum height, label type at 0.18em tracking. An icon may lead at 1rem.
- **Hover / Focus:** border and text shift to Harbour Slate, with a 10% Harbour Slate wash (200ms). On press the button scales to 0.97 (150ms), and under reduced motion it dims to 80% opacity instead. The focus-visible ring is 2px Harbour Slate.
- **Hero CTA (over imagery, home globe hero):** a taller pill (3rem min height, 1.625rem side padding), 1px white border at 40% over a 5% white fill with a 4px backdrop blur, white uppercase label at 0.24em tracking, and a trailing arrow. On hover it inverts to solid white with ink text, and the arrow slides 4px right (300ms, ease-out-soft).
- **Text links as actions:** "next journey" and similar use an uppercase label beside a 32px hairline that grows to 48px and brightens on hover. The growth is a `scaleX` on a fixed 48px line (negative margin keeps the label still), anchored on the side away from the label, never an animated `width`.

### Cards / Containers
- **Album card:** square (or 2-column featured at lg), 0px corners, the cover as a real lazy-loaded `<img>` (`object-cover`, responsive `srcset`; the square 400px thumb only for square cards) under a black scrim (85% → 30% → 0% upward). Covers are never CSS background images. Caption block inset 1.25rem → 1.5rem with the serif title over a label-type place · date line in white at 80%. On hover the cover slowly zooms to 1.04 (1200ms ease-out). When the globe points at the album, a 1px Harbour Slate border and the inset glow fade in (250ms).
- **Background:** cards have no fill of their own; the photograph is the surface. Placeholders use Chart Table.
- **Shadow strategy:** none (see Elevation & Depth).

### Inputs / Fields
- **Search field:** no box. It is a bare serif line at headline size (1.5rem → 1.875rem) on a transparent ground with a single underline in Fog at 60% (3.5:1, enough to find the field), and the placeholder is Fog at 80%.
- **Focus:** the underline brightens to Sea Salt. There is no glow and no ring on the field itself.

### Navigation
- **Header:** sticky glass bar (thick glass over content, light glass over a hero image), with the wordmark at left and serif nav links at 0.875rem/500 at right, 2.25rem apart. Links go to Harbour Slate on hover; the current page is Sea Salt with a 1px Harbour Slate underline offset 8px (`aria-current="page"`). The locale toggle sits at the end in uppercase. A skip link to `#main` is the first focusable element, visible only on focus.
- **Mobile:** a hamburger (44px target) opens a full-screen thick-glass dialog. Nav items stack as 1.875rem serif headlines, left-aligned and vertically centered (scrolling instead of clipping on short landscape screens), with the locale toggle below as an eyebrow. Focus is trapped while open and returns to the opener on close.
- **Filter tabs (search):** eyebrow-type words in Fog. The active tab turns Sea Salt with a 1px Sea Salt underline 0.5rem below.
- **Footer:** a single Rigging Line hairline above, then the tagline and legal links in label type, Fog, brightening to Sea Salt on hover.

### Chapter (signature)
The carnet's page. Each chapter opens on a full-width cover (16:9 → 21:9) with an ink scrim rising from the bottom, then a centered header (eyebrow "Chapter n" in Fog, serif headline, location summary and stats), the route map, the narrative (max 65ch, 1.125rem sans at line-height 2 in Fog, opening on a serif drop cap in Sea Salt), and finally the photo grid with featured photos in larger cells.

### Globe Hero (signature)
The home page opens on an interactive globe with album locations as markers, on a radial gradient whose lifted center is derived from the accent (The Derived Tone Rule) and whose edge is the page ground (The Ink Ground Rule). Copy sits left at lg behind a left-to-right ink scrim: an eyebrow kicker, the display headline, an italic lede, the hero CTA, and a hairline-ruled list of albums. Marker labels are small tracked uppercase tags on 82% ink glass with a 45% Harbour Slate border. The globe scales in from 0.92 over 1400ms, and the copy rises 18px in sequence. The globe mounts once its column is near the viewport and the browser is idle, renders on a lighter budget on touch devices, stops its loop off-screen, and has a "Pause the globe" control (Fog label type, bottom of the globe column) that freezes the spin, rings and arcs; it is hidden when reduced motion is on, since nothing moves then. Markers facing away leave the tab order; the album list is the keyboard path.

### Map Globe
The `/map` globe view uses the same markers, colored from the theme variables, and a hairline album list under it (List type) so far-side albums stay reachable by keyboard. On touch screens it only spins horizontally and lets vertical swipes scroll the page.

### Lightbox
Full-screen on black at 97%. Controls are bare eyebrow-type words in white at 60–70% (100% on hover): slideshow, counter, details, close, inset from the notch and home indicator. They collapse to 44px icon buttons on mobile, and previous/next are thin oversized arrows. The overlay is keyboard-modal, announces "Photo n of m" as you move (quiet during the slideshow), leaves Space to a focused control, and supports pinch zoom with the pan clamped to the photo's edges.

## Do's and Don'ts

### Do:
- **Do** take every color from the six `--color-*` variables and every family from `--font-display` / `--font-sans`, so all nine presets keep working.
- **Do** end every gradient, scrim and fade on `--color-background` (The Ink Ground Rule).
- **Do** mix any missing tone from the theme variables with `color-mix()` (The Derived Tone Rule).
- **Do** set metadata and controls in uppercase sans at the eyebrow (0.32em), label (0.24em) or micro (0.24em) tracking steps.
- **Do** keep photographs square-cornered and full-bleed or column-wide, with text below or on a scrim.
- **Do** separate sections with space (5–7rem) and hairlines, not boxes.
- **Do** use the two named curves for motion: `ease-out-soft` (cubic-bezier(0.23, 1, 0.32, 1)) for entrances, reveals and hover zooms, and `ease-settle` (cubic-bezier(0.32, 0.72, 0, 1)) for things coming to rest.
- **Do** switch off all entrance, reveal and zoom motion under `prefers-reduced-motion`, and make glass solid under reduced transparency or increased contrast.
- **Do** give every interactive element a 44px target and a visible 2px Harbour Slate focus ring that follows the element's own corners.
- **Do** size type in rem and full-height surfaces in `svh`/`dvh`.
- **Do** animate with `transform` and `opacity` (`scaleX` for growing hairlines, `translate` for nudges); never animate `width` or padding.

### Don't:
- **Don't** drift toward the travel-blog / influencer look: big CTAs, subscribe prompts, affiliate cards.
- **Don't** add social-feed mechanics: likes, counters, avatars, infinite feeds.
- **Don't** add SaaS or dashboard chrome: shadowed cards, badges, chip clouds, rounded panels.
- **Don't** fall back on the stock portfolio template: centered hero text over a photo, three-column feature rows.
- **Don't** hardcode one preset's hex in a component. The code already corrected this once for Ocean Blue's `#14283a`.
- **Don't** fill large areas with Harbour Slate. It is a hairline, ring and marker color (The Hairline Accent Rule).
- **Don't** give a surface a `box-shadow` for elevation; only map chrome is exempt (The No-Shadow Rule).
- **Don't** put rounded-rectangle frames around photographs or maps (The Square Print Rule).
