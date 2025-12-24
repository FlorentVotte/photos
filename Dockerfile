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

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Pre-compile sync scripts to JavaScript (eliminates tsx at runtime)
RUN npx tsc -p tsconfig.sync.json

# Stage 3: Production dependencies (minimal)
FROM node:20-alpine AS prod-deps
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

# Create minimal package.json with only runtime deps
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install production only, then remove unnecessary packages
RUN npm ci --omit=dev && \
    rm -rf node_modules/typescript node_modules/tsx node_modules/@types && \
    rm -rf node_modules/eslint* node_modules/tailwindcss node_modules/autoprefixer node_modules/postcss

RUN npx prisma generate

# Stage 4: Runner (minimal)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Minimal runtime dependencies only
RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone Next.js build (minimal)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy pre-compiled sync scripts (JS, no tsx needed)
COPY --from=builder /app/dist/sync ./dist/sync
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/prisma ./prisma

# Entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create directories
RUN mkdir -p /app/public/photos /app/data && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
