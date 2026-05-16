# Audit todo list — 2026-05-16

Generated from a full-codebase security audit + UI/UX audit of https://photos.votte.eu. All 23 items shipped across two PRs.

## Security — PR [#72](https://github.com/FlorentVotte/photos/pull/72) (branch `harden-admin-and-oauth-security`)

| # | Status | Severity | Title |
|---|--------|----------|-------|
| 1 | ✅ done | HIGH | Gate `/api/adobe/albums` GET with `requireAuth` |
| 2 | ✅ done | MEDIUM | Require admin auth on Adobe OAuth initiate route |
| 3 | ✅ done | MEDIUM | Add OAuth `state` CSRF protection on initiate |
| 4 | ✅ done | MEDIUM | Require admin auth + verify OAuth state in callback |
| 5 | ✅ done | Watch | Fix missing `await` on `isAuthenticated()` in adobe/status route |
| 6 | ✅ done | Watch | Tighten photo path-traversal guard |
| 7 | ✅ done | Watch | Escape script-breakers in JSON-LD payloads |
| 8 | ✅ done | Watch | Strict host check on gallery URL submission |
| 9 | ✅ done | Watch | Deduplicate crypto key derivation between Next app and sync CLI |

### Findings detail

**[HIGH] broken_auth** — `src/app/api/adobe/albums/route.ts:56` — GET had no auth check; unauthenticated callers could enumerate the admin's Lightroom catalog UUID and every album's name/ID/asset-count.

**[MEDIUM] csrf / broken_auth** — `src/app/api/auth/adobe/route.ts` and `…/callback/route.ts` — Both endpoints were unauthenticated and the OAuth flow had no `state` parameter, letting any visitor bind the site's stored Adobe token row to an attacker-controlled Adobe account.

**Watch items** — `auth/adobe/status` Promise-not-awaited dead check; `photos/[...path]` prefix check without trailing separator; JSON-LD payloads not escaping `</script>` / U+2028 / U+2029; gallery URL validator using `includes()` instead of strict host check; sync CLI's scrypt params disagreeing with the Next app's.

## UI/UX — PR [#73](https://github.com/FlorentVotte/photos/pull/73) (branch `ui-ux-wave-6`)

| # | Status | Impact | Title |
|---|--------|--------|-------|
| 10 | ✅ done | HIGH | Fix theme font CSS-var injection at `:root` |
| 11 | ✅ done | HIGH | Use chapter/album context for photo-detail title |
| 12 | ✅ done | HIGH | Add themed `not-found.tsx` |
| 13 | ✅ done | MEDIUM | Serve responsive thumbnails (and remove dead `OptimizedImage`) |
| 14 | ✅ done | MEDIUM | Make mobile menu a true overlay with scroll-lock |
| 15 | ✅ done | MEDIUM | Style hero + photo-action CTAs as actual buttons |
| 16 | ✅ done | MEDIUM | Make search deep and accent-insensitive |
| 17 | ✅ done | MEDIUM | Localize country list on About page (EN) |
| 18 | ✅ done | LOW | Bump muted labels from 11px to 12px |
| 19 | ✅ done | LOW | Formalize album-card featured size (kicker label) |
| 20 | ✅ done | LOW | Fix orphaned rows on `/albums` year buckets |
| 21 | ✅ done | LOW | Replace default focus ring with theme-tinted ring |
| 22 | ✅ done | LOW | Add scrim/text-shadow to album-card overlay meta |
| 23 | ✅ done | LOW | Decide image-protection strategy (kept cosmetic deterrent; the M1 srcset fix handles the actual leakage) |

### Findings detail

**[H1]** `globals.css @theme` declared `--font-family-display` / `--font-family-sans`, which is not the namespace Tailwind v4 recognizes for font-family utilities — so `.font-display` was never generated and the body's `font-display` class was a no-op. Renamed to `--font-display` / `--font-sans` so per-theme font swaps actually apply.

**[H2]** Photo detail H1, `<title>`, breadcrumb tail, share metadata, and image `alt` derive from album + positional index when the underlying title looks like a camera filename (`DSCF0678.raf`, `IMG_0964.HEIC`). Helper: `src/lib/photo-display.ts`.

**[H3]** Added `src/app/not-found.tsx`. Bilingual via translations.

**[M1]** `ProtectedImage` now accepts a `sources` prop (thumb/medium/full) and emits `srcset` + `sizes`. Chapter hero + photo-detail main image opted in. Dead `OptimizedImage` component removed.

**[M2]** Mobile menu rewritten as a fixed `inset-0` overlay with backdrop blur, body scroll lock, and Escape-to-close.

**[M3]** Home hero "View Album" and photo-detail Download/Share/Slideshow are now rounded outlined chips with hover + theme-tinted focus.

**[M4]** Search now NFD-normalizes diacritics on both query and corpus and indexes album subtitle / description / chapter title+narrative (FR+EN) / photo caption / description / city / location-detail.

**[M5]** `src/lib/country-names.ts` maps FR ↔ EN country names; AboutContent localizes via `localizeCountryNames(..., locale)`.

**[L1]** All `text-[11px]` bumped to `text-[12px]` globally.
**[L2]** `AlbumCard` accepts `featuredLabel`; HomeContent passes `t("home", "featuredStory")` on the first card — the larger title now reads as intentional.
**[L3]** `/albums` uses a 2×2 grid when a year bucket has exactly 4 albums.
**[L4]** Global `:focus-visible { outline: 2px solid var(--color-primary) }`.
**[L5]** Stronger gradient scrim + `text-shadow` on card meta.
**[L6]** Kept cosmetic `ProtectedImage` deterrent — the M1 srcset fix already stops grid views from serving 2400px renditions, which was the real leakage.
