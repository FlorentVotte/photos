# Stage 1: Dependencies (all) — used by the Next.js build
FROM node:26-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json ./
COPY prisma ./prisma
# Placeholder for prisma generate — real URL is set at runtime.
ENV DATABASE_URL="file:/tmp/photobook.db"
RUN npm ci
RUN npx prisma generate

# Stage 2: Builder
FROM node:26-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/tmp/photobook.db"
RUN npm run build

# Pre-compile sync scripts to JavaScript
RUN npx tsc -p tsconfig.sync.json

# Stage 3: Runtime dependencies — reproducible, pinned via package-lock.json.
# Installs only production deps (omits dev/optional), so the image stays
# reasonably small while guaranteeing the exact same versions as CI tests.
FROM node:26-alpine AS runtime-deps
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json ./
COPY prisma ./prisma

ENV DATABASE_URL="file:/tmp/photobook.db"
RUN npm ci --omit=dev --omit=optional
RUN npx prisma generate

# Stage 4: Runner (minimal)
FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat sqlite

# Remove npm from the runtime image entirely.
#
# npm vendors its own dependency tree (undici, tar, ip-address, brace-expansion,
# ...) inside /usr/local/lib/node_modules/npm. Those copies are unreachable from
# package.json — no dependency bump, override or `npm update` touches them — and
# they go stale faster than npm cuts releases, so they show up as HIGH/CRITICAL
# findings that can only be fixed by an npm release that may not exist yet. The
# earlier approach here was to upgrade npm to patch them; that turned the deploy
# red twice (once when npm@latest dropped the base image's Node version, once
# when a scanner DB update flagged six CVEs with no fixed npm to move to).
#
# Nothing in the runtime needs npm: the entrypoint calls ./node_modules/.bin/prisma
# and the sync route spawns `node dist/sync/index.js` directly. Deleting it makes
# the whole class structurally absent rather than suppressed.
#
# Build stages above still use npm for `npm ci` and `npm run build`.
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/bin/npm \
           /usr/local/bin/npx

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone Next.js build (self-contained, no node_modules needed)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy pre-compiled sync scripts.
# Copy all of dist/, not just dist/sync: tsconfig.sync.json has rootDir "." and
# includes src/lib/crypto.ts, so tsc emits dist/sync/*.js AND dist/src/lib/crypto.js.
# dist/sync/index.js requires "../src/lib/crypto", so copying only dist/sync
# produced a runtime "Cannot find module" the moment sync was invoked.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# prisma.config.ts is required by Prisma 7 CLI (migrate deploy / migrate
# resolve) to resolve the datasource URL. Without it the entrypoint
# crashes with "datasource.url property is required".
COPY --from=builder /app/prisma.config.ts ./

# Pinned production node_modules (for the sync CLI).
COPY --from=runtime-deps /app/node_modules ./node_modules

# Entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

RUN mkdir -p /app/public/photos /app/data && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
