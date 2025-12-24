# Stage 1: Dependencies (all)
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Pre-compile sync scripts to JavaScript
RUN npx tsc -p tsconfig.sync.json

# Stage 3: Sync dependencies only (minimal)
FROM node:20-alpine AS sync-deps
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY prisma ./prisma

# Install ONLY the packages needed for sync scripts
RUN npm init -y && \
    npm install --no-save \
      @prisma/client@latest \
      @prisma/adapter-better-sqlite3@latest \
      better-sqlite3@latest \
      sharp@latest \
      exifreader@latest && \
    npx prisma generate

# Stage 4: Runner (minimal)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone Next.js build (self-contained, no node_modules needed)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy pre-compiled sync scripts
COPY --from=builder /app/dist/sync ./dist/sync
COPY --from=builder /app/prisma ./prisma

# Copy ONLY sync dependencies (not full node_modules)
COPY --from=sync-deps /app/node_modules ./node_modules

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
