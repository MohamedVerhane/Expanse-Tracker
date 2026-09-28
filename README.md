# Expense Tracker

A full-stack personal expense tracker built with Next.js. Track your spending, filter and sort expenses, and see where your money goes through simple dashboard charts.

## Features

- Email/password authentication with JWT sessions stored in HTTP-only cookies
- Create, edit, and delete expenses with categories
- Search, filter (category, date range, amount range), sort, and paginate
- Dashboard with totals, monthly trend, and a breakdown by category
- Light / dark theme
- Bilingual UI: English and Arabic, with full RTL layout support
- Responsive layout (sidebar on desktop, drawer on mobile)

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- SQLite via [Prisma](https://www.prisma.io) ORM — embedded file database, no server required
- Auth: [jose](https://github.com/panva/jose) (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + [zod](https://github.com/colinhacks/zod)
- Charts: [Recharts](https://recharts.org)
- Theme: [next-themes](https://github.com/pacocoursey/next-themes), toasts via [sonner](https://sonner.emilkowal.ski)
- Icons: [Font Awesome](https://fontawesome.com)

## Requirements

- Node.js 18+ (Node 20+ recommended)
- Nothing else — the database is a local SQLite file, so there is no database
  server to install or run

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file (see `.env.example`):

   ```ini
   DATABASE_URL="file:./prisma/dev.db"
   AUTH_SECRET="replace-with-a-long-random-string"
   ```

   > `DATABASE_URL` points at the SQLite file, relative to the project root. The
   > database is created automatically on the first migration, so the file does
   > not need to exist yet.

   > `AUTH_SECRET` should be at least 16 characters. Generate one with `openssl rand -base64 32`.

3. Run the database migration and seed the default categories:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 and create an account.

## Database

The whole database lives in a single file, `prisma/dev.db` by default. It is
created and migrated by Prisma, and it is listed in `.gitignore`.

To point at a different location, change `DATABASE_URL` to another `file:`
path. Relative paths are resolved against the project root, so the Prisma CLI
and the Next.js server always open the same file:

```ini
DATABASE_URL="file:./data/expenses.db"
```

To start over from an empty database, delete the file and re-run
`npm run db:migrate && npm run db:seed`.

## Deployment

SQLite is a file on disk, so the app needs a **long-lived Node.js server with a
persistent volume**. It must run as a **single instance** — replicas cannot
share the same database file.

> **Not compatible with Vercel.** Serverless functions have a read-only
> filesystem with only ephemeral `/tmp` scratch space, so every write would be
> discarded. See Vercel's own note:
> [Is SQLite supported in Vercel?](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel).
> If you need Vercel, use a hosted database instead (for example
> [Turso/libSQL](https://turso.tech), which is SQLite-compatible and has a free
> tier).

### Required environment variables

Set these on the host. Do not commit a `.env` file.

| Variable           | Value                                              |
| ------------------ | -------------------------------------------------- |
| `DATABASE_URL`     | `file:/data/expense-tracker.db` — on the volume    |
| `AUTH_SECRET`      | Long random string, min 16 chars                   |
| `SMTP_*`           | Only if you use email verification                 |
| `MAIL_FROM_*`      | Only if you use email verification                 |

Generate a secret with `openssl rand -base64 32`.

The default categories are inserted automatically the first time they are
needed, so there is no seeding step in production.

### Build and start commands

Migrations deliberately run at **start**, not at build: the database only
exists on the runtime host, once the volume is attached.

| Step    | Command                |
| ------- | ---------------------- |
| Install | `npm ci`               |
| Build   | `npm run build`        |
| Start   | `npm run db:deploy && npm run start` |

### Docker

The included `Dockerfile` follows exactly that order and defaults
`DATABASE_URL` to `file:/data/expense-tracker.db`, so mount a volume at
`/data`:

```bash
docker build -t expense-tracker .
docker run -p 3000:3000 \
  -v expense-data:/data \
  -e AUTH_SECRET="$(openssl rand -base64 32)" \
  expense-tracker
```

No C++ toolchain is needed in the image: `better-sqlite3` ships prebuilt
binaries, and `package.json` denies its install script so `npm ci` never tries
to compile it.

### Platform settings

For a platform that builds from the repository without Docker, use:

- **Build command:** `npm ci && npm run build`
- **Start command:** `npm run db:deploy && npm run start`
- **Volume:** a persistent disk mounted at `/data`

This maps directly onto Railway, Render (a "Disk"), Fly.io (a `volume` on the
service) or a plain VPS. On a VPS you can skip Docker entirely and use
`systemd` or `pm2` to run `npm run db:deploy && npm run start`.

Put a reverse proxy such as nginx or Caddy in front of the app for TLS and
request limits.

## Scripts

| Script               | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start the development server                 |
| `npm run build`      | Build for production                         |
| `npm run start`      | Run the production build                     |
| `npm run lint`       | Lint with ESLint                             |
| `npm run test`       | Run the verification tests                   |
| `npm run db:migrate` | Create/apply a migration in development       |
| `npm run db:deploy`  | Apply pending migrations (production)         |
| `npm run db:push`    | Push schema to the database (no migration)   |
| `npm run db:seed`    | Seed default categories (production data)    |
| `npm run db:seed:demo` | Seed demo users + sample expenses (dev only) |
| `npm run db:reset`   | Drop, re-migrate and re-seed the database     |

## Demo data

For local testing you can load demo data (20 users + 10,000 expenses):

```bash
npm run db:seed:demo
```

Then sign in with `user1@example.com` … `user20@example.com` (password `Password123!`).

## Internationalization

The app ships in English and Arabic. The language switcher (top-right) stores the choice in a cookie and flips the layout to RTL for Arabic. Category names and UI strings are translated; chart axes and spacing also adapt to the reading direction.

## Project structure

```
src/
  app/            # routes: (auth), (dashboard), api-less actions
  components/     # UI, layout, charts, auth, expenses
  lib/            # prisma client, auth, i18n, validation, utils
  actions/        # server actions (auth, expenses, locale)
prisma/           # schema, migrations, seed scripts
```
