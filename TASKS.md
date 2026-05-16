# Audit todo list — 2026-05-16

Generated from a full-codebase security audit + UI/UX audit of https://photos.votte.eu.

## Security (branch: `harden-admin-and-oauth-security`)

| # | Status | Severity | Title |
|---|--------|----------|-------|
| 1 | ✅ completed | HIGH | Gate `/api/adobe/albums` GET with `requireAuth` |
| 2 | ✅ completed | MEDIUM | Require admin auth on Adobe OAuth initiate route |
| 3 | ✅ completed | MEDIUM | Add OAuth `state` CSRF protection on initiate |
| 4 | ✅ completed | MEDIUM | Require admin auth + verify OAuth state in callback |
| 5 | ✅ completed | Watch | Fix missing `await` on `isAuthenticated()` in adobe/status route |
| 6 | ✅ completed | Watch | Tighten photo path-traversal guard |
| 7 | ✅ completed | Watch | Escape script-breakers in JSON-LD payloads |
| 8 | ✅ completed | Watch | Strict host check on gallery URL submission |
| 9 | 🔄 in progress | Watch | Deduplicate crypto key derivation between Next app and sync CLI |

### Findings detail

**[HIGH] broken_auth** — `src/app/api/adobe/albums/route.ts:56` — GET had no auth check; unauthenticated callers could enumerate the admin's Lightroom catalog UUID and every album's name/ID/asset-count.

**[MEDIUM] csrf / broken_auth** — `src/app/api/auth/adobe/route.ts` and `…/callback/route.ts` — Both endpoints were unauthenticated and the OAuth flow had no `state` parameter, letting any visitor bind the site's stored Adobe token row to an attacker-controlled Adobe account.

**Watch items** — `auth/adobe/status` Promise-not-awaited dead check; `photos/[...path]` prefix check without trailing separator; JSON-LD payloads not escaping `</script>` / U+2028 / U+2029; gallery URL validator using `includes()` instead of strict host check; sync CLI's scrypt params disagreeing with the Next app's.

## UI/UX (branch: TBD — `ui-ux-wave-6`)

| # | Status | Impact | Title |
|---|--------|--------|-------|
| 10 | ⏳ pending | HIGH | Fix theme font CSS-var injection at `:root` |
| 11 | ⏳ pending | HIGH | Use chapter/album context for photo-detail title |
| 12 | ⏳ pending | HIGH | Add themed `not-found.tsx` |
| 13 | ⏳ pending | MEDIUM | Serve responsive thumbnails (or remove dead `OptimizedImage`) |
| 14 | ⏳ pending | MEDIUM | Make mobile menu a true overlay with scroll-lock |
| 15 | ⏳ pending | MEDIUM | Style hero + photo-action CTAs as actual buttons |
| 16 | ⏳ pending | MEDIUM | Make search deep and accent-insensitive |
| 17 | ⏳ pending | MEDIUM | Localize country list on About page (EN) |
| 18 | ⏳ pending | LOW | Bump muted labels from 11px to 12–13px |
| 19 | ⏳ pending | LOW | Unify or formalize album-card title sizes |
| 20 | ⏳ pending | LOW | Fix orphaned rows on `/albums` year buckets |
| 21 | ⏳ pending | LOW | Replace default focus ring with theme-tinted ring |
| 22 | ⏳ pending | LOW | Add scrim/drop-shadow to album-card overlay meta |
| 23 | ⏳ pending | LOW | Decide image-protection strategy |

### Findings detail

**[H1]** `getComputedStyle(html).getPropertyValue('--font-display')` returns empty; body falls back to `ui-sans-serif`. `generateThemeCSSVars` in `src/app/layout.tsx:141` isn't producing `--font-display` / `--font-sans` at `:root`. Whole per-theme font swap is dead.

**[H2]** Photo detail H1, document `<title>`, breadcrumb tail, and share metadata show raw filenames (`DSCF0678.raf`). Use chapter / album / location instead. File: `src/components/PhotoContent.tsx`.

**[H3]** Unknown routes drop to Next's default black-on-white "404 / This page could not be found." — no header, footer, theme. Add `app/not-found.tsx`.

**[M1]** Grid photos use `<ProtectedImage>` → plain `<img>` with no srcset/sizes; Oman chapter hero serves 2048×1365 into 1004×430. `OptimizedImage` is defined but unused. Route through `next/image` or a custom thumb endpoint.

**[M2]** Hamburger menu pushes content down rather than overlaying; body scrollHeight stays 3269px, scroll-lock not engaged. `src/components/Header.tsx`.

**[M3]** Home hero "View Album" and photo-detail action row (DOWNLOAD / SHARE / SLIDESHOW) lack button affordance.

**[M4]** Search returns 0 results for "désert" although chapter intros contain it. Doesn't index chapter intros / photo descriptions, doesn't accent-fold.

**[M5]** EN About page still says "Italie / Royaume-Uni / Suisse".

**[L1]** Muted labels at 11px — bump to 12–13px.
**[L2]** Album-card title 36px featured vs 24px elsewhere reads as glitch.
**[L3]** 3-col `/albums` grid leaves single orphan cards per year-section.
**[L4]** Default browser blue focus ring clashes with slate/teal palette.
**[L5]** White-on-photo album meta hard to read on bright photos — add scrim.
**[L6]** `ProtectedImage` protection is cosmetic — decide: remove or downsize server-side.
