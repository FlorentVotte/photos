# P1/P2 Remediation Design

## Goal

Resolve every P1 and P2 issue from the 2026-09-04 UX, UI, accessibility,
and security review while preserving the existing visual direction and public
photo-browsing experience. Photo downloads remain available, and the legal
terms will explicitly permit private, non-commercial downloads.

## Scope

The work is split into three independently reviewable tracks:

1. production and application security;
2. accessible navigation and media exploration;
3. search, localization, theme, legal, and content consistency.

P3-only findings are excluded: equipment-name truncation, exact-GPS publishing
policy, and dependency upgrades whose advisories are not reachable through the
current SQLite deployment. The existing lint backlog may be fixed where touched,
but unrelated lint refactors are not part of this change.

## Security design

### Production secrets

`docker-compose.yml` will no longer provide a known admin password or an empty
encryption-key fallback. Compose must fail interpolation when `ADMIN_PASSWORD`,
`ENCRYPTION_KEY`, and the immutable image identifier are absent. The container
entrypoint will also validate that production secrets are non-empty, reject the
known legacy password, and require an encryption key of at least 32 characters.

`src/lib/crypto.ts` will throw in production when `ENCRYPTION_KEY` is absent or
invalid. Development may retain its documented fallback so local onboarding is
not broken. This changes production failure from a warning to a startup/runtime
failure before Adobe tokens can be stored under a weak derived key.

### Authentication and session handling

The login redirect will be accepted only when it is a same-origin absolute path:
it must begin with one `/`, must not begin with `//`, and must not contain a URL
scheme. Invalid values fall back to `/admin`.

Signed session tokens will include a version and server-validated expiry. The
signature covers both the random token and the expiry, and verification rejects
expired or malformed values. Server and browser expiry remain two hours.
Existing cookies become invalid on deployment; administrators will sign in
again once.

Login throttling will use both a bounded per-client limiter and a bounded global
limiter. The existing proxy-provided address remains the per-client key, while
the global limit prevents header variation from creating unlimited guesses.
Expired entries are pruned and the map has a hard capacity with deterministic
oldest-entry eviction, preventing unbounded memory growth. Limits are five
failed attempts per client and 50 failed attempts globally per 15 minutes, with
at most 10,000 client keys retained. Responses retain the generic authentication
error model.

### API boundary and request sizes

`GET /api/galleries` is an admin inventory endpoint and will require the same
signed session as its mutation methods. A shared JSON reader will enforce a
small byte limit before parsing, including chunked requests that omit
`Content-Length`. Authentication bodies are capped at 4 KiB, ordinary metadata
requests at 64 KiB, and chapter batches at 512 KiB. Oversized requests return
413 and invalid JSON returns 400 without exposing parser details.

### Browser policy

The deprecated `src/middleware.ts` convention will be migrated to Next.js 16
`src/proxy.ts`. It will retain `/admin` authorization and add a fresh nonce to
document requests. The enforced CSP will use nonce-based scripts with
`strict-dynamic`, block objects and framing, restrict forms and base URLs to the
site, and explicitly allow only the local app plus OpenFreeMap resources needed
by the map. Element styles use nonces; dynamic React style attributes remain
allowed through a separate `style-src-attr` directive. Development alone may
allow evaluation required by the React toolchain.

HSTS, `frame-ancestors 'none'`, and the existing content-type, referrer, and
permissions policies apply consistently. The CSP is verified against home,
photo, map, globe, legal, and admin/login rendering before completion.

### Supply chain and deployment

GitHub Actions references will be pinned to full commit SHAs, with readable
comments retaining the release tag. Container builds already produce a commit
SHA tag; deployment and Compose will consume that immutable tag instead of
`latest`. The workflow must pass the selected tag explicitly to both `pull` and
`up`, so rollback targets remain identifiable.

## Accessibility and navigation design

### Shared overlay behavior

A reusable focus-management hook/component will provide the behavior shared by
the mobile menu and lightbox:

- move focus to a deliberate initial control on open;
- trap Tab and Shift+Tab within the overlay;
- expose modal semantics where appropriate;
- make background content inert while open;
- close on Escape; and
- restore focus to the opening control.

Closed mobile-navigation content will be unmounted, so invisible links cannot
enter the tab order. The lightbox will expose `role="dialog"`, `aria-modal`, and
an accessible name. Its narrow-screen toolbar will switch to compact controls
that do not overlap at 320 CSS pixels.

### Map and globe

Globe markers will become native buttons with album-specific accessible names
and visible focus treatment. Continuous auto-rotation will be disabled when the
user requests reduced motion.

Hundreds of Leaflet markers will not remain in the keyboard tab sequence.
Instead, the visual markers stay pointer-operable and a semantic, paginated
"Mapped photos" list below the visualization provides equivalent keyboard and
screen-reader navigation. The list starts with a manageable batch and uses an
explicit accessible "Load more" button in batches of 25. Marker popups retain
descriptive image text.

The basemap will use a theme-matched fallback surface, invalidate its dimensions
after initialization, and expose a visible localized failure message when the
vector basemap cannot initialize. Mobile verification must confirm that the
previous blank band is gone or replaced by the intentional fallback.

### Landmarks and photo labels

The homepage content will be wrapped in a `main` landmark. Photo pages will add
the standard footer, restoring direct access to privacy and legal information.
Photo-grid links will prefer caption or descriptive title text; filename-like
titles fall back to a localized album-aware "Photo N" label rather than exposing
camera filenames as the accessible name.

## UX, locale, and content design

### Search

Search keeps its minimalist layout but becomes complete and shareable:

- query and content filter are represented in URL parameters;
- the text field has a persistent accessible label;
- filter controls expose pressed state;
- result changes use a polite live region; and
- photos render in batches of 50 with an explicit "Load more" control until all
  matching results are reachable.

Changing the query or filter resets the displayed batch. Invalid URL filter
values fall back to `all`. Browser Back, refresh, and copied URLs reproduce the
same search state.

### Locale and theme

Locale preference will be persisted in a cookie in addition to client state.
Server rendering reads the cookie and, for a first visit, the request language;
the resulting locale initializes the provider and the `<html lang>` attribute.
Locale changes update both cookie and document language without a flash through
an English-only intermediate render. The preference cookie is SameSite=Lax,
Secure in production, readable by the client, and retained for one year.

The identified hardcoded public strings are moved into the translation catalog:
GPS counts, route summaries, location/capture headings, loading/failure states,
mapped-photo controls, and fallback photo labels. Legal and privacy metadata is
locale-aware. Making locale request-aware also ensures the database-selected
theme is resolved at request time for legal and privacy pages rather than being
frozen to the build fallback.

Missing location components are filtered before display. Literal `Unknown`
values are never included in chapter summaries or photo details; a localized
fallback appears only when the entire useful location is absent.

### Download terms

The download button remains unchanged in purpose. The legal terms will state:

- downloading for private, non-commercial viewing is permitted;
- copyright remains with the photographer; and
- copying, redistribution, republication, modification, automated bulk
  downloading, and commercial use require explicit authorization.

The French and English versions must express the same permissions and limits.

## Error handling

Security failures fail closed and return generic client messages. Oversized or
malformed inputs do not reach business logic. UI controls preserve the current
page when state is invalid, fall back to safe defaults, and announce recoverable
errors without trapping focus. Map failure leaves the semantic photo list fully
usable.

## Testing and acceptance

Behavior changes follow red-green TDD. Security utilities and routes receive
unit tests for missing secrets, redirect edge cases, token expiry, limiter
capacity/global limits, gallery authentication, and JSON size boundaries.
Search utilities receive tests for URL parsing and pagination reset. Overlay,
locale, label, and map behavior receive focused component or static-render tests
where the repository's test environment supports them.

Completion requires:

1. all targeted regression tests passing;
2. the full Vitest suite passing;
3. ESLint passing for touched files, with the repository-wide result reported;
4. a successful production build under a supported Node runtime;
5. no unexpected tracked-file changes;
6. keyboard verification of both overlays and map/globe alternatives;
7. visual verification at 320x568, 375x812, and 1280x900; and
8. response-header verification for CSP and HSTS.

Each track receives a requirements review and a code-quality review before the
next track begins, followed by a final whole-branch review.
