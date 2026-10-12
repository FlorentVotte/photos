# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **The owner (Florent Votte), first.** Regards Perdus is foremost a personal travel archive. The owner is also the only admin and the only author of albums and chapter text.
- **Friends and family** following a trip as it is published, or coming back to one later, reading the chapter narratives.
- **Strangers** arriving from Instagram (@flovotte), a shared link, or search, and browsing the photography.

Not audiences: prospective clients, print buyers, or other photographers self-hosting the code. The site has no commercial goal.

## Product Purpose

Regards Perdus is the owner's personal travel photography site, served at photos.votte.eu. It turns Lightroom albums into trip stories: albums split into narrative chapters, a globe and map of where each photo was taken, a page per photo with capture details, and search.

Tagline (EN/FR): "Capturing the fleeting moments between departures and arrivals." / "Capturer les instants fugaces entre les départs et les arrivées."

Success means the archive is a pleasure for the owner to revisit, and a friend or stranger can follow a trip from start to finish. No commercial goal was identified.

## Positioning

- **Lightroom is the only source of photos.** The owner edits and curates in Lightroom; the site syncs public galleries or private albums (Adobe API). The site never uploads or edits photos.
- **A trip reads as a story, not a grid.** Albums carry ordered chapters with EN/FR narrative text, featured photos, a chapter cover, route maps, and per-chapter location summaries and stats.
- **Places are a way in.** The home page opens on an interactive globe of album locations; `/map` shows every geotagged photo in 2D and on a 3D globe.
- **Self-hosted and owned.** One Docker container and a SQLite file on the owner's server, with no third-party platform in between.

## Operating Context

- **Owner workflow:** shoot, then edit and curate in Lightroom, then add the gallery URL or private album in `/admin/albums` and run a sync (CLI, watch mode, webhook, or admin panel). Chapters are written in `/admin/chapters` (EN and FR fields). Covers, featured albums, site settings, and the theme are set in `/admin/settings`.
- **Visitor arrival:** Instagram and shared links (each album has a generated Open Graph image), search engines (sitemap and structured data), or direct visits. The device mix is not known.
- **Deployment:** pushing to `main` runs the tests and builds a Docker image that GitHub Actions deploys over SSH. The site is installable as a PWA and has an offline page.

## Capabilities and Constraints

**Public surfaces:** home (globe hero, quote, recent albums), `/albums`, `/album/[slug]` (chapters, route maps, gallery, next journey), `/photo/[id]` (EXIF, mini-map, download, share, slideshow, lightbox with pinch zoom and keyboard navigation), `/map` (2D map and 3D globe), `/search`, `/about` (gear and journey stats derived from EXIF), `/legal`, `/privacy`, `/offline`.

**Admin surfaces:** `/admin`, `/admin/albums`, `/admin/chapters`, `/admin/settings`. They sit behind a password and serve one user, the owner.

**Binding constraints:**

- Photos only arrive through the Lightroom sync. No in-app upload, editing, or reordering of image files.
- The published download terms must stay true: private, non-commercial downloading is permitted; copying, redistribution, republication, modification, automated or bulk downloading, and commercial use require authorization. Copyright belongs to Florent Votte.
- A nonce-based Content Security Policy is enforced (`src/proxy.ts`). Fonts and the icon font are self-hosted, and the basemap (OpenFreeMap) is credited and disclosed in the privacy policy. Any new third-party resource needs a CSP change and a privacy-policy update.

**Current behavior, not binding:**

- The site is bilingual EN/FR (`src/lib/translations.ts`, locale switching, EN/FR chapter fields). The owner did not mark strict parity as a constraint.
- Nine theme presets with their own font pairings can be switched from `/admin/settings`. The owner did not mark them as something to preserve, so consolidating them is an open decision for any redesign.
- `inspiration/` holds 15 Stitch HTML mocks (home, album, photo pages). They are historical reference only and are not binding.

**Open facts:**

- The site name has two sources. Code hardcodes "Regards Perdus" (`src/lib/data.ts`, metadata), while the DB `siteTitle` is admin-editable and defaults to "Photo Portfolio".
- The visitors' device mix is unknown.

## Brand Commitments

- Name: **Regards Perdus**. Photographer name shown on the site: "Florent". Legal owner: Florent Votte (florent@votte.eu, www.votte.eu). Instagram: @flovotte.
- The code is licensed CC BY-NC-SA 4.0 and the photographs are all rights reserved under the download terms above.

## Evidence on Hand

- **Real photos exist only in production and Lightroom.** The local `photobook.db` has no albums. In development the site falls back to a sample album ("Lost in Kyoto") with external placeholder images. That is demo data, never real content.
- Real copy lives in `src/lib/translations.ts` (EN/FR), plus the legal and privacy pages.
- Assets: globe textures (`public/globe/`), app icons (`public/icons/`), the self-hosted Material Symbols font (`public/fonts/`).
- **Absent, never to fabricate:** testimonials, press, clients, commissions, print sales, visitor numbers, and any album, trip, place, or statistic that does not come from synced data.

## Product Principles

1. **The photographs and the trip lead.** Every surface serves looking at the pictures and following the journey; chrome and features stay secondary.
2. **Lightroom stays the source of truth.** The owner never manages a photo twice; the site reflects the sync and adds only story (chapters, text, covers).
3. **Built for coming back.** This is an archive revisited over years by the owner and people close to them, so pace and story matter more than engagement or conversion.
4. **Owned and private by default.** Self-hosted, minimal third parties, and the published terms honored everywhere.

## Accessibility & Inclusion

Recent work set the bar that new surfaces must meet: overlays are keyboard-modal, with focus trapped and then restored to the opener; maps have accessible keyboard navigation; globe markers are keyboard-safe; motion respects `prefers-reduced-motion`.
