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
- MySQL via [Prisma](https://www.prisma.io) ORM
- Auth: [jose](https://github.com/panva/jose) (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + [zod](https://github.com/colinhacks/zod)
- Charts: [Recharts](https://recharts.org)
- Theme: [next-themes](https://github.com/pacocoursey/next-themes), toasts via [sonner](https://sonner.emilkowal.ski)
- Icons: [Font Awesome](https://fontawesome.com)

## Requirements

- Node.js 18+ (Node 20+ recommended)
- A MySQL database (e.g. via WAMP, XAMPP, or Docker)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file (see `.env.example`):

   ```ini
   DATABASE_URL="mysql://root:@localhost:3306/expense_tracker"
   DATABASE_PASSWORD=""
   AUTH_SECRET="replace-with-a-long-random-string"
   ```

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

## Scripts

| Script               | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start the development server                 |
| `npm run build`      | Build for production                         |
| `npm run start`      | Run the production build                     |
| `npm run lint`       | Lint with ESLint                             |
| `npm run db:migrate` | Apply Prisma migrations                      |
| `npm run db:push`    | Push schema to the database (no migration)   |
| `npm run db:seed`    | Seed default categories (production data)    |
| `npm run db:seed:demo` | Seed demo users + sample expenses (dev only) |

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
