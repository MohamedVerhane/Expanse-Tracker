# syntax=docker/dockerfile:1

# The app runs on a long-lived Node server with a persistent volume, so the
# SQLite file survives restarts. It must NOT be deployed to a serverless host
# such as Vercel, where the filesystem is read-only and ephemeral.

FROM node:24-slim AS deps
WORKDIR /app

# better-sqlite3 ships prebuilt binaries in its tarball, and package.json
# denies its install script, so no C++ toolchain is needed here.
COPY package.json package-lock.json ./
RUN npm ci


FROM node:24-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# `next build` imports server components, which construct the Prisma client.
# Point it at a throwaway path so a build can never touch a real database.
ENV DATABASE_URL="file:/tmp/build.db"

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Mount a persistent volume here, e.g. `docker run -v expense-data:/data ...`
ENV DATABASE_URL="file:/data/expense-tracker.db"

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# `prisma migrate deploy` runs on start, so the CLI needs the schema,
# the migrations, the generated client and its config.
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/src ./src

EXPOSE 3000

# Migrations run at start-up, not at build time: the database only exists on
# the runtime host, once the volume is attached.
CMD ["sh", "-c", "npm run db:deploy && npm run start"]
