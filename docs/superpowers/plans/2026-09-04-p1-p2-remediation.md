# P1/P2 Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every approved P1/P2 security, accessibility, UI, UX, localization, and legal issue while preserving photo downloads and the existing visual direction.

**Architecture:** Add small, pure security and presentation helpers at system boundaries, then wire them into existing routes and client components. Request-aware locale/theme state lives in the root layout; modal focus behavior is shared by the menu and lightbox; map/search pagination remains client-side and exposes every item without rendering hundreds of controls at once.

**Tech Stack:** Next.js 16.3.1 App Router and Proxy, React 19, TypeScript 5.9, Vitest 4, Tailwind CSS 4, Leaflet/MapLibre, React Three Fiber, Docker Compose, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-04-p1-p2-remediation-design.md`

## Global Constraints

- Use `/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin` first in `PATH` for every npm command; the system Node 18 is unsupported.
- Follow red-green TDD: add each regression assertion and observe it fail before implementation.
- Preserve the photo download button and permit only private, non-commercial downloads in both English and French legal copy.
- Production requires non-empty `ADMIN_PASSWORD`, `ENCRYPTION_KEY`, and immutable `PHOTOBOOK_IMAGE`; reject `ADMIN_PASSWORD=admin123`; require `ENCRYPTION_KEY.length >= 32`.
- Sessions expire after exactly `AUTH.SESSION_EXPIRY_SECONDS` (two hours) on both client and server.
- Login limits are 5 failed attempts per client and 50 failures globally per 15 minutes, retaining at most 10,000 client keys.
- JSON body limits are 4 KiB for login, 64 KiB for ordinary metadata mutations, and 512 KiB for chapter batches; return 413 for oversized bodies and 400 for malformed JSON.
- Locale cookie name is `locale`, values are `en` or `fr`, `SameSite=Lax`, `Secure` only in production, client-readable, `Max-Age=31536000`, and `Path=/`.
- Search batches contain 50 photos; mapped-photo batches contain 25 photos.
- Do not broaden scope to P3 findings, dependency-upgrade work, exact-GPS policy, or unrelated lint cleanup.
- Read `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` and the Next 16 Proxy reference before changing `src/proxy.ts` or the root layout.

---

### Task 1: Production Secret Fail-Closed Behavior

**Files:**
- Modify: `docker-compose.yml`
- Modify: `docker-entrypoint.sh`
- Create: `scripts/validate-production-env.sh`
- Modify: `src/lib/crypto.ts`
- Modify: `src/lib/crypto.test.ts`

**Interfaces:**
- Consumes: `NODE_ENV`, `ADMIN_PASSWORD`, `ENCRYPTION_KEY`, and `PHOTOBOOK_IMAGE` environment variables.
- Produces: `getEncryptionKey()` behavior that throws `ENCRYPTION_KEY must be at least 32 characters in production`; Compose image `${PHOTOBOOK_IMAGE:?PHOTOBOOK_IMAGE must be set to an immutable image tag}`.

- [ ] **Step 1: Add failing production-key tests**

Add cases that dynamically import `./crypto` after setting the environment so module state cannot leak:

```ts
it.each([undefined, "short"])(
  "rejects invalid production ENCRYPTION_KEY %s",
  async (key) => {
    process.env.NODE_ENV = "production";
    if (key === undefined) delete process.env.ENCRYPTION_KEY;
    else process.env.ENCRYPTION_KEY = key;
    const { encrypt: productionEncrypt } = await import("./crypto");
    expect(() => productionEncrypt("token")).toThrow(
      "ENCRYPTION_KEY must be at least 32 characters in production"
    );
  }
);
```

- [ ] **Step 2: Run the focused test and observe failure**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/crypto.test.ts`

Expected: FAIL because production currently logs and derives a weak fallback.

- [ ] **Step 3: Make crypto and deployment configuration fail closed**

In `getEncryptionKey`, use development fallback only outside production and reject invalid production keys:

```ts
if (process.env.NODE_ENV === "production" && (!key || key.length < 32)) {
  throw new Error("ENCRYPTION_KEY must be at least 32 characters in production");
}
if (!key) {
  const fallback = process.env.ADMIN_PASSWORD || "default-key-change-me";
  return crypto.scryptSync(fallback, KEY_DERIVATION_SALT, 32, SCRYPT_OPTIONS);
}
```

Change Compose to:

```yaml
image: ${PHOTOBOOK_IMAGE:?PHOTOBOOK_IMAGE must be set to an immutable image tag}
environment:
  - PHOTOBOOK_IMAGE=${PHOTOBOOK_IMAGE:?PHOTOBOOK_IMAGE must be set to an immutable image tag}
  - ADMIN_PASSWORD=${ADMIN_PASSWORD:?ADMIN_PASSWORD must be set}
  - ENCRYPTION_KEY=${ENCRYPTION_KEY:?ENCRYPTION_KEY must be set}
```

Create `scripts/validate-production-env.sh` as a POSIX-shell command that returns immediately outside production and, in production, rejects empty secrets, `admin123`, encryption keys shorter than 32 characters, and a `PHOTOBOOK_IMAGE` containing `:latest` or lacking a tag/digest. Each failure prints one actionable line to stderr and exits non-zero. At the top of `docker-entrypoint.sh`, before database work, run `./scripts/validate-production-env.sh`.

- [ ] **Step 4: Verify crypto and shell validation**

Run the focused Vitest command again; expected PASS.

Run: `env ADMIN_PASSWORD=admin123 ENCRYPTION_KEY=12345678901234567890123456789012 PHOTOBOOK_IMAGE=ghcr.io/florentvotte/photos:sha-deadbeef sh -n docker-entrypoint.sh`

Expected: exit 0 from syntax validation.

Run these exact checks; each command before the final valid case must exit non-zero, and the final command must exit zero:

```bash
env NODE_ENV=production ADMIN_PASSWORD=admin123 ENCRYPTION_KEY=12345678901234567890123456789012 PHOTOBOOK_IMAGE=ghcr.io/florentvotte/photos:sha-deadbeef sh scripts/validate-production-env.sh
env NODE_ENV=production ADMIN_PASSWORD=verification-password-change-me ENCRYPTION_KEY=short PHOTOBOOK_IMAGE=ghcr.io/florentvotte/photos:sha-deadbeef sh scripts/validate-production-env.sh
env NODE_ENV=production ADMIN_PASSWORD=verification-password-change-me ENCRYPTION_KEY=12345678901234567890123456789012 PHOTOBOOK_IMAGE=ghcr.io/florentvotte/photos:latest sh scripts/validate-production-env.sh
env NODE_ENV=production ADMIN_PASSWORD=verification-password-change-me ENCRYPTION_KEY=12345678901234567890123456789012 PHOTOBOOK_IMAGE=ghcr.io/florentvotte/photos:sha-deadbeef sh scripts/validate-production-env.sh
```

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml docker-entrypoint.sh scripts/validate-production-env.sh src/lib/crypto.ts src/lib/crypto.test.ts
git commit -m "fix: require production secrets"
```

### Task 2: Expiring Sessions, Safe Redirects, and Bounded Login Throttling

**Files:**
- Create: `src/lib/redirects.ts`
- Create: `src/lib/redirects.test.ts`
- Modify: `src/lib/constants.ts`
- Modify: `src/lib/session.ts`
- Create: `src/lib/session.test.ts`
- Modify: `src/lib/security.ts`
- Modify: `src/lib/security.test.ts`
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/auth/login/route.test.ts`
- Modify: `src/app/login/page.tsx`

**Interfaces:**
- Produces: `safeInternalRedirect(value: string | null | undefined, fallback?: string): string`.
- Produces: session cookie format ``v1.${tokenHex}.${expiryUnixSeconds}.${signatureHex}``, where the token and signature are each 64 lowercase hexadecimal characters.
- Produces: `new RateLimiter(windowMs, maxAttempts, capacity?)`, plus a global limiter keyed by the constant string `global`.

- [ ] **Step 1: Add failing redirect, session, limiter, and route tests**

Cover these exact cases:

```ts
expect(safeInternalRedirect("/admin/albums?tab=all")).toBe("/admin/albums?tab=all");
for (const unsafe of ["//evil.example", "https://evil.example", "javascript:alert(1)", "admin"]) {
  expect(safeInternalRedirect(unsafe)).toBe("/admin");
}
```

Use fake timers to assert a newly signed token verifies, becomes invalid at two hours plus one second, and old `token.signature` cookies are rejected. Add a capacity test that inserts 10,001 unique keys and asserts `sizeForTests() === 10000` and the oldest key was evicted. Add login-route tests for the sixth per-client failure returning 429 and the 51st globally varied client returning 429.

- [ ] **Step 2: Run focused tests and observe failures**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/redirects.test.ts src/lib/session.test.ts src/lib/security.test.ts src/app/api/auth/login/route.test.ts`

Expected: FAIL for missing safe redirect, missing signed expiry, unbounded limiter, and absent global throttling.

- [ ] **Step 3: Implement the pure redirect and session formats**

`safeInternalRedirect` must trim nothing and accept only a path matching the single-leading-slash rule:

```ts
export function safeInternalRedirect(value: string | null | undefined, fallback = "/admin") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(value)) {
    return fallback;
  }
  return value;
}
```

Sign `v1.${tokenHex}.${expirySeconds}` and validate version, exact token/signature lengths, integer expiry, and `expirySeconds > Math.floor(Date.now() / 1000)` before accepting the signature. Pass `AUTH.SESSION_EXPIRY_SECONDS` from the login route.

- [ ] **Step 4: Bound the limiter and wire login defenses**

Extend `RateLimiter` with a default `capacity = 10_000`, expired-entry pruning before reads/writes, and deterministic eviction of the Map's first key when inserting past capacity. Add `sizeForTests()` only as a read-only inspection method. In the login route, use per-client 5/15m and global 50/15m limiters, count failures only, and do not clear the global limiter on success. Keep proxy headers as the per-client key but normalize the first non-empty comma-delimited address and cap it to 200 characters.

Use `safeInternalRedirect(searchParams.get("redirect"))` before `router.push`.

- [ ] **Step 5: Run focused tests and commit**

Run the Step 2 command; expected PASS.

```bash
git add src/lib/redirects.ts src/lib/redirects.test.ts src/lib/constants.ts src/lib/session.ts src/lib/session.test.ts src/lib/security.ts src/lib/security.test.ts src/app/api/auth/login/route.ts src/app/api/auth/login/route.test.ts src/app/login/page.tsx
git commit -m "fix: harden admin authentication"
```

### Task 3: Authenticated Inventory and Streaming JSON Limits

**Files:**
- Create: `src/lib/request-json.ts`
- Create: `src/lib/request-json.test.ts`
- Modify: `src/app/api/galleries/route.ts`
- Create: `src/app/api/galleries/route.test.ts`
- Modify: `src/app/api/albums/route.ts`
- Modify: `src/app/api/chapters/route.ts`
- Modify: `src/app/api/settings/route.ts`
- Modify: `src/app/api/sync/route.ts`
- Modify: `src/app/api/sync/stream/route.ts`
- Modify: affected route tests under `src/app/api/**/route.test.ts`

**Interfaces:**
- Produces: `JSON_BODY_LIMITS = { AUTH: 4096, METADATA: 65536, CHAPTERS: 524288 }`.
- Produces: `readJsonBody<T>(request: Request, maxBytes: number): Promise<T>`.
- Produces: `JsonBodyError` with `status: 400 | 413` and public `message` equal to `Invalid JSON body` or `Request body too large`.

- [ ] **Step 1: Add failing reader and galleries authorization tests**

Reader tests must cover a valid body, malformed bytes, a `Content-Length` above the limit, and a chunked stream that crosses the limit without `Content-Length`:

```ts
await expect(readJsonBody(new Request("https://test", { method: "POST", body: "{" }), 64))
  .rejects.toMatchObject({ status: 400 });
await expect(readJsonBody(chunkedRequest(["1234", "5678"]), 7))
  .rejects.toMatchObject({ status: 413 });
```

Mock `requireAuth` and assert unauthenticated `GET /api/galleries` returns 401 without calling Prisma; authenticated GET returns the existing inventory shape.

- [ ] **Step 2: Run focused tests and observe failures**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/request-json.test.ts src/app/api/galleries/route.test.ts`

Expected: FAIL because the reader does not exist and GET is public.

- [ ] **Step 3: Implement streaming bounded parsing**

Reject a numeric `Content-Length` above the limit before reading. Otherwise consume `request.body.getReader()` incrementally, add `value.byteLength` before retaining the chunk, cancel on overflow, concatenate no more than the limit, decode with fatal UTF-8 handling, then `JSON.parse`. Translate decoding/parsing failures to `JsonBodyError(400, "Invalid JSON body")` and overflow to `JsonBodyError(413, "Request body too large")`.

- [ ] **Step 4: Apply the helper to JSON mutation routes**

Call `requireAuth()` at the start of galleries GET. Replace direct `request.json()` calls with `readJsonBody` using:

- `AUTH` for login;
- `CHAPTERS` for chapters POST and DELETE;
- `METADATA` for albums, galleries, settings, sync, and sync/stream.

At each route boundary, catch `JsonBodyError` and return `NextResponse.json({ error: error.message }, { status: error.status })`; do not collapse it into the route's generic 500 handler. An absent body on sync/stream may remain the existing “sync all” behavior, but an oversized body must return 413.

- [ ] **Step 5: Run affected tests and commit**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/request-json.test.ts src/app/api/auth/login/route.test.ts src/app/api/galleries/route.test.ts src/app/api/albums/route.test.ts`

Expected: PASS.

```bash
git add src/lib/request-json.ts src/lib/request-json.test.ts src/app/api
git commit -m "fix: bound API JSON bodies"
```

### Task 4: Next 16 Proxy, Nonce CSP, and Consistent Security Headers

**Files:**
- Delete: `src/middleware.ts`
- Create: `src/proxy.ts`
- Create: `src/proxy.test.ts`
- Modify: `src/app/layout.tsx`
- Modify: `next.config.mjs`

**Interfaces:**
- Produces: `buildContentSecurityPolicy(nonce: string, isDevelopment: boolean): string`.
- Produces: Next 16 `proxy(request: NextRequest)` with a matcher excluding API, `_next/static`, `_next/image`, favicon, manifest, icons, and static photo/globe assets.
- Produces: request header `x-nonce` and enforced response header `Content-Security-Policy` for document requests.

- [ ] **Step 1: Read the bundled Next 16 CSP and Proxy documentation**

Read the complete relevant sections of `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` and `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`. Follow their current export name, matcher, nonce, request-header, and response-header examples.

- [ ] **Step 2: Add failing CSP/proxy tests**

Assert the policy contains the nonce in `script-src`, `'strict-dynamic'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, separate `style-src-elem 'self' 'nonce-…'` and `style-src-attr 'unsafe-inline'`, and OpenFreeMap HTTPS/WSS hosts in the image/connect clauses. Assert production excludes `'unsafe-eval'` and development includes it. Exercise `/admin` with an invalid cookie and assert redirect to `/login?redirect=/admin`; exercise `/` and assert nonce headers exist.

- [ ] **Step 3: Run the proxy test and observe failure**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/proxy.test.ts`

Expected: FAIL because `src/proxy.ts` does not exist.

- [ ] **Step 4: Implement proxy and layout nonce propagation**

Generate a cryptographically random base64 nonce, set `x-nonce` and CSP on cloned request headers passed to `NextResponse.next({ request: { headers } })`, and set CSP on the response. Preserve admin-session verification and safe redirect construction. For the root layout, call `headers()` and attach the nonce to the app's inline theme `<style nonce={nonce}>`; do not add `unsafe-inline` to `script-src` or `style-src-elem`.

Move static headers to `next.config.mjs`: HSTS `max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and existing `Permissions-Policy`. Remove obsolete `X-XSS-Protection` and duplicate admin-only copies.

- [ ] **Step 5: Verify and commit**

Run the Step 3 command; expected PASS.

```bash
git add src/proxy.ts src/proxy.test.ts src/app/layout.tsx next.config.mjs
git rm src/middleware.ts
git commit -m "fix: enforce nonce content security policy"
```

### Task 5: Immutable CI Actions and Image Deployment

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `.github/workflows/codeql.yml`
- Create: `src/lib/workflow-security.test.ts`

**Interfaces:**
- Consumes: build output `image_ref` equal to `ghcr.io/${{ github.repository }}:${{ github.sha }}`.
- Produces: deploy-time `PHOTOBOOK_IMAGE` passed to both `docker compose pull photobook` and `docker compose up -d photobook`.

- [ ] **Step 1: Add a failing static workflow regression test**

Read both YAML files as text. Reject any `uses:` value not ending in a 40-hex SHA, reject `photos:latest`, and assert deploy exports `PHOTOBOOK_IMAGE` from the build job's exact SHA image reference before pull/up.

- [ ] **Step 2: Run the test and observe failure**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/workflow-security.test.ts`

Expected: FAIL on mutable action tags and latest deployment.

- [ ] **Step 3: Pin every action and deploy the immutable image**

Use these exact resolved SHAs, retaining the tag in a comment:

```yaml
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
uses: dorny/test-reporter@1cc81a5edf733718d4850df304aaa21c05cd7280 # v3
uses: docker/setup-buildx-action@37fe631027851001ddb9b187196cc803df7f5f0e # v4
uses: docker/login-action@dbcb813823bdd20940b903addbd779551569679f # v4
uses: docker/metadata-action@dc802804100637a589fabce1cb79ff13a1411302 # v6
uses: docker/build-push-action@53b7df96c91f9c12dcc8a07bcb9ccacbed38856a # v7
uses: aquasecurity/trivy-action@a9c7b0f06e461e9d4b4d1711f154ee024b8d7ab8 # v0.36.0
uses: github/codeql-action/upload-sarif@fddeee1a7ece751b577e409a89057319e3172939 # v4
uses: github/codeql-action/init@fddeee1a7ece751b577e409a89057319e3172939 # v4
uses: github/codeql-action/analyze@fddeee1a7ece751b577e409a89057319e3172939 # v4
uses: appleboy/ssh-action@0ff4204d59e8e51228ff73bce53f80d53301dee2 # v1.2.5
```

Make `build.outputs.image_ref` the explicit `${REGISTRY}/${IMAGE_NAME}:${GITHUB_SHA}` value. Remove the raw `latest` metadata tag. In the SSH script export `PHOTOBOOK_IMAGE='${{ needs.build.outputs.image_ref }}'`, then run `docker compose pull photobook` and `docker compose up -d photobook`.

- [ ] **Step 4: Run the focused test and commit**

Run the Step 2 command; expected PASS.

```bash
git add .github/workflows/deploy.yml .github/workflows/codeql.yml src/lib/workflow-security.test.ts
git commit -m "fix: pin deployment supply chain"
```

### Task 6: Shared Overlay Focus Management

**Files:**
- Create: `src/hooks/useModalFocus.ts`
- Create: `src/lib/focus-management.ts`
- Create: `src/lib/focus-management.test.ts`
- Modify: `src/hooks/index.ts`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Lightbox.tsx`
- Modify: `src/lib/translations.ts`

**Interfaces:**
- Produces: `getFocusableElements(container: HTMLElement): HTMLElement[]`.
- Produces: `useModalFocus({ isOpen, containerRef, initialFocusRef, onClose, inertRootSelector? })`.

- [ ] **Step 1: Add failing pure focus-order tests**

Use minimal HTMLElement-shaped fixtures or a DOM-free exported `resolveFocusTargetIndex(currentIndex, count, shiftKey)` helper and assert wrapping from last to first and first to last, plus zero/one-item behavior. Assert disabled and negative-tabindex items are excluded from `getFocusableElements` if a DOM fixture is supported by Vitest.

- [ ] **Step 2: Run the focused test and observe failure**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/focus-management.test.ts`

Expected: FAIL because the focus helper does not exist.

- [ ] **Step 3: Implement the hook and wire the mobile menu**

On open, remember `document.activeElement`, set `inert` and `aria-hidden` only on background siblings outside the overlay, focus the initial control on the next animation frame, trap Tab/Shift+Tab, close on Escape, and restore focus on cleanup. Restore every prior `inert`/`aria-hidden` value exactly.

Keep the menu button as the opener. Render the mobile overlay only when `mobileMenuOpen` is true. Give it `role="dialog"`, `aria-modal="true"`, and an accessible label, pass its nav container to the hook, and focus the first navigation link.

- [ ] **Step 4: Wire the lightbox and compact mobile controls**

Give the lightbox root `role="dialog"`, `aria-modal="true"`, `aria-label={currentPhoto.title || t("lightbox", "dialogLabel")}`, and a ref used by the shared hook. Add `dialogLabel` as `Photo viewer` / `Visionneuse de photos` in the translation catalog. Focus the close button. At widths below `sm`, use icon-only 44px controls with accessible names, tighter gaps, and hide keyboard-hint text so close/details/play/navigation controls do not overlap at 320px.

- [ ] **Step 5: Verify helper tests and commit**

Run the Step 2 command; expected PASS.

```bash
git add src/hooks/useModalFocus.ts src/hooks/index.ts src/lib/focus-management.ts src/lib/focus-management.test.ts src/lib/translations.ts src/components/Header.tsx src/components/Lightbox.tsx
git commit -m "fix: make overlays keyboard modal"
```

### Task 7: Accessible Map, Globe, and Basemap Failure State

**Files:**
- Create: `src/lib/pagination.ts`
- Create: `src/lib/pagination.test.ts`
- Modify: `src/components/PhotoMap.tsx`
- Modify: `src/components/BasemapLayer.tsx`
- Modify: `src/components/MapFitBounds.tsx`
- Modify: `src/components/Globe3D.tsx`
- Modify: `src/components/PhotoGlobe.tsx`
- Modify: `src/components/MapContent.tsx`
- Modify: `src/lib/translations.ts`

**Interfaces:**
- Produces: `nextVisibleCount(current: number, total: number, batchSize: number): number`.
- Produces: `BasemapLayer({ onError }: { onError: () => void })`.
- Produces: `Globe3D` prop `markerFallbackLabel?: string` and native marker buttons with `aria-label` equal to the album marker label or that localized fallback.

- [ ] **Step 1: Add failing pagination/reduced-motion helper tests**

Assert 25 → 50 → total behavior and clamping for a final partial batch. Extract and test `resolveAutoRotateSpeed(pointerOver, prefersReducedMotion)` so reduced motion always returns zero and ordinary idle state returns `0.3`.

- [ ] **Step 2: Run focused tests and observe failure**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/pagination.test.ts`

Expected: FAIL because pagination/reduced-motion helpers do not exist.

- [ ] **Step 3: Make the Leaflet map usable without tabbing every marker**

Configure Leaflet markers with `keyboard={false}` and descriptive popup image alt text. Below the map render a `<section aria-labelledby="mapped-photos-heading">` whose translated heading is “Mapped photos” / “Photos cartographiées”, containing the first 25 geotagged photos as normal links with caption/descriptive-title labels. Add a translated `Load more` button while hidden items remain and a polite count summary. Reset visible count when `photos` changes.

Use a theme-matched `bg-surface-dark` fallback on the map container. Have `BasemapLayer` call `onError` from import/layer errors and render a localized visible status overlay while leaving markers/list functional. Call `map.invalidateSize()` on the next animation frame in `MapFitBounds` before fitting bounds.

- [ ] **Step 4: Make globe controls semantic and motion-safe**

Replace each marker's clickable `<div>` with `<button type="button" aria-label={marker.label || markerFallbackLabel}>`, preserve pointer handlers, add `focus-visible` ring styles, and make Enter/Space use native click behavior. Add `markerFallbackLabel?: string` to `Globe3DProps`, default it to `Photo album`, and pass the localized `t("map", "albumMarker")` value from `PhotoGlobe`. Read `prefers-reduced-motion: reduce` with the existing media-query hook or `matchMedia`; pass `0` auto-rotation whenever true.

- [ ] **Step 5: Run tests and commit**

Run the Step 2 command; expected PASS.

```bash
git add src/lib/pagination.ts src/lib/pagination.test.ts src/lib/translations.ts src/components/PhotoMap.tsx src/components/BasemapLayer.tsx src/components/MapFitBounds.tsx src/components/Globe3D.tsx src/components/PhotoGlobe.tsx src/components/MapContent.tsx
git commit -m "fix: add accessible map navigation"
```

### Task 8: Request-Aware Locale, Theme, and Legal Copy

**Files:**
- Create: `src/lib/locale.ts`
- Create: `src/lib/locale.test.ts`
- Modify: `src/lib/LocaleContext.tsx`
- Modify: `src/lib/translations.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/legal/page.tsx`
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/components/LegalContent.tsx`
- Modify: `src/components/PrivacyContent.tsx`

**Interfaces:**
- Produces: `resolveLocale(cookieValue: string | undefined, acceptLanguage: string | null): Locale`.
- Changes: `LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode })`.

- [ ] **Step 1: Add failing locale and legal-copy tests**

Assert valid cookie wins, invalid/missing cookie falls back to a French `Accept-Language`, and everything else uses English:

```ts
expect(resolveLocale("en", "fr-FR,fr;q=0.9")).toBe("en");
expect(resolveLocale(undefined, "fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr");
expect(resolveLocale("de", "de-DE")).toBe("en");
```

Add catalog assertions that English and French legal download terms both explicitly permit private/non-commercial download, retain photographer copyright, and prohibit redistribution/commercial/automated bulk use. Assert the obsolete `termNoDownload` key is absent.

- [ ] **Step 2: Run focused tests and observe failure**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/locale.test.ts`

Expected: FAIL because server locale resolution and new legal terms do not exist.

- [ ] **Step 3: Make locale request-aware without an English flash**

In the async root layout, read `cookies()` and `headers()`, call `resolveLocale`, set `<html lang={locale}>`, and pass `initialLocale={locale}`. Initialize client state directly from the prop; remove the mounted gate and localStorage-first boot path. On change, update React state, `document.documentElement.lang`, localStorage for backward compatibility, and this exact cookie shape:

```ts
document.cookie = `locale=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
```

Because cookie/header reads make the root request-aware, keep database theme lookup in the same request and verify legal/privacy no longer freeze the fallback theme at build time.

- [ ] **Step 4: Update localized metadata and legal/privacy disclosure**

Replace static legal/privacy metadata with `generateMetadata` that resolves the request locale and returns localized title/description. Replace the prohibition text with equivalent English/French strings:

```text
EN: You may download photographs for private, non-commercial viewing. Copyright remains with the photographer. Copying, redistribution, republication, modification, automated bulk downloading, and commercial use require explicit authorization.
FR: Vous pouvez télécharger les photographies pour une consultation privée et non commerciale. Les droits d’auteur restent la propriété du photographe. Toute copie, redistribution, republication, modification, tout téléchargement automatisé en masse et tout usage commercial nécessitent une autorisation explicite.
```

Update privacy copy from localStorage-only language storage to the locale cookie plus localStorage compatibility behavior.

- [ ] **Step 5: Run tests and commit**

Run the Step 2 command; expected PASS.

```bash
git add src/lib/locale.ts src/lib/locale.test.ts src/lib/LocaleContext.tsx src/lib/translations.ts src/app/layout.tsx src/app/legal/page.tsx src/app/privacy/page.tsx src/components/LegalContent.tsx src/components/PrivacyContent.tsx
git commit -m "fix: render locale and legal terms consistently"
```

### Task 9: Complete Search, Descriptive Labels, Content Cleanup, and Photo Footer

**Files:**
- Create: `src/lib/search-state.ts`
- Create: `src/lib/search-state.test.ts`
- Modify: `src/app/search/SearchClient.tsx`
- Modify: `src/lib/photo-display.ts`
- Modify: `src/lib/photo-display.test.ts`
- Modify: `src/components/PhotoGrid.tsx`
- Modify: `src/lib/transformers.ts`
- Modify: `src/lib/transformers.test.ts`
- Modify: `src/components/ChapterLocationSummary.tsx`
- Modify: `src/components/ChapterStats.tsx`
- Modify: `src/components/ChapterRouteMap.tsx`
- Modify: `src/components/PhotoContent.tsx`
- Modify: `src/app/photo/[id]/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/lib/translations.ts`

**Interfaces:**
- Produces: `parseSearchState(params: URLSearchParams): { query: string; filter: "all" | "albums" | "photos" }`.
- Produces: `serializeSearchState(query: string, filter: FilterType): string`.
- Produces: `formatPhotoAccessibleLabel(photo, album, index, locale): string` preferring caption, then descriptive title, then localized `Photo N` with album context.
- Produces: `cleanLocationParts(...parts: Array<string | null | undefined>): string[]` that removes blanks and case-insensitive `Unknown`.

- [ ] **Step 1: Add failing state, label, and location tests**

Cover URL decode/encode, invalid filter → `all`, omission of default empty params, and pagination reset as a pure reducer. Assert caption beats title, descriptive title beats filename, and filename fallback is `Album — Photo 7` / `Album — Photo 7` in French (using translated `Photo`). Assert `cleanLocationParts("Paris", "Unknown", "France")` returns `['Paris', 'France']` and all-unknown returns `[]`.

- [ ] **Step 2: Run focused tests and observe failure**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- --run src/lib/search-state.test.ts src/lib/photo-display.test.ts src/lib/transformers.test.ts`

Expected: FAIL for missing helpers and retained `Unknown` values.

- [ ] **Step 3: Make search complete, accessible, and URL-backed**

Initialize state from `useSearchParams`, and on query/filter change call `router.replace` with `serializeSearchState` without scrolling. Reset visible photo count to 50 on either change and respond to Back/Forward param changes. Add a visually hidden `<label htmlFor="photo-search">`, `aria-pressed` on filter buttons, and a result summary with `aria-live="polite" aria-atomic="true"`. Replace `slice(0, 50)` with `slice(0, visibleCount)` and add a translated `Load more` button that advances by 50 until all results render. Invalid URL filters display `all` and normalize on the next interaction.

- [ ] **Step 4: Apply descriptive labels and remove literal Unknown**

Use `formatPhotoAccessibleLabel` for photo-grid link `aria-label` and image alt. Stop injecting `"Unknown"` in transformers; leave absent values empty/undefined. Use `cleanLocationParts` in chapter and photo detail summaries. Show a translated unknown-location fallback only when no useful component remains.

Move every remaining identified hardcoded public string into translations: GPS partial count, route-location count, `Location`, `Capture`, search load-more, fallback photo label, and previous/next photo labels. Map/globe loading, map failure, mapped-photo controls, and the lightbox dialog label are owned by Tasks 7 and 6 respectively.

- [ ] **Step 5: Add landmarks and the photo-page footer**

Wrap `HomeExperience` in `<main>` without changing layout. Import and render the standard `<Footer />` after `<PhotoContent />` in `src/app/photo/[id]/page.tsx`; preserve the page's flex column so the footer follows content naturally.

- [ ] **Step 6: Run focused tests and commit**

Run the Step 2 command; expected PASS.

```bash
git add src/lib/search-state.ts src/lib/search-state.test.ts src/lib/photo-display.ts src/lib/photo-display.test.ts src/lib/transformers.ts src/lib/transformers.test.ts src/lib/translations.ts src/app/search/SearchClient.tsx src/components/PhotoGrid.tsx src/components/ChapterLocationSummary.tsx src/components/ChapterStats.tsx src/components/ChapterRouteMap.tsx src/components/PhotoContent.tsx 'src/app/photo/[id]/page.tsx' src/app/page.tsx
git commit -m "fix: complete public browsing experience"
```

### Task 10: Integrated Verification and Regression Cleanup

**Files:**
- Modify only files already in Tasks 1–9 when a verification failure demonstrates a regression.

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: a buildable branch with recorded automated, header, keyboard, and responsive evidence.

- [ ] **Step 1: Run the full Vitest suite**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test`

Expected: all tests PASS; record total tests and duration.

- [ ] **Step 2: Run ESLint on touched source files**

Run ESLint with the explicit touched paths from Tasks 1–9. Expected: zero errors in touched files. Then run repository-wide `npm run lint` and report separately any pre-existing unrelated failures; do not expand scope merely to make the baseline green.

- [ ] **Step 3: Run the production build under Node 24**

Run: `env PATH=/Users/florent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin ADMIN_PASSWORD=verification-password-change-me ENCRYPTION_KEY=0123456789abcdef0123456789abcdef NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000 npm run build`

Expected: exit 0 with no deprecated middleware warning.

- [ ] **Step 4: Verify headers and critical routes locally**

Start the production server with the same safe verification secrets. Resolve a concrete photo route with `PHOTO_ID=$(sqlite3 data/photobook.db 'SELECT id FROM Photo ORDER BY sortOrder LIMIT 1;')`, fail the check if it is empty, then use `curl -I` on `/`, `/photo/${PHOTO_ID}`, `/map`, `/legal`, `/login`, and `/admin`; assert CSP has a per-response nonce, HSTS is present, the admin redirect is safe, and unauthenticated `/api/galleries` returns 401. Compare two document requests and assert nonces differ.

- [ ] **Step 5: Run keyboard and visual acceptance checks**

At 320x568, 375x812, and 1280x900 verify:

- mobile menu and lightbox focus enters, wraps, Escape closes, and opener focus returns;
- lightbox toolbar never overlaps at 320px;
- map failure/fallback never creates a blank band and its mapped-photo list remains usable;
- globe markers are keyboard buttons and reduced motion stops rotation;
- search Back/refresh/copy preserve state and every result is reachable via Load more;
- French has correct `<html lang="fr">` and no English strings from the approved list;
- photo detail pages end with privacy/legal footer links; and
- legal terms permit private non-commercial downloads while forbidding redistribution and commercial use.

- [ ] **Step 6: Inspect repository state and commit verification fixes if any**

Run: `git status --short` and `git diff --check`.

Expected: no unexpected tracked changes and no whitespace errors. If verification required code changes, add a focused regression test, observe it fail before the fix, rerun the relevant checks, stage only tracked paths already owned by Tasks 1–9, and commit them:

```bash
git add -u
git commit -m "fix: resolve integrated P1 P2 regressions"
```
