FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl
# pnpm version comes from "packageManager" in package.json
RUN corepack enable

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm exec prisma generate
RUN pnpm build

# Prisma CLI for running migrations at container start (the standalone
# server bundle doesn't include it)
FROM base AS migrator
WORKDIR /migrate
RUN npm init -y >/dev/null \
  && npm install --omit=dev --no-audit --no-fund prisma@7.8.0 dotenv@17.4.2

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=migrator /migrate/node_modules /migrate/node_modules
COPY prisma.config.ts /migrate/prisma.config.ts
COPY prisma/schema.prisma /migrate/prisma/schema.prisma
COPY prisma/migrations /migrate/prisma/migrations
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
