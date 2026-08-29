# Expense Tracker

A full-stack personal expense management application built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **MySQL**. Track your spending, organize expenses by category, and visualize trends through an interactive dashboard.

## Features

- **Authentication** — Register, login, logout, secure password hashing (bcrypt), JWT sessions in HTTP-only cookies, protected routes via middleware, and per-user data isolation.
- **Expense CRUD** — Create, read, update, and delete expenses with amount, description, category, and date.
- **Categories** — Predefined categories (Food, Transport, Education, Entertainment, Shopping, Bills, Health, Other) seeded into the database and designed to be extended.
- **Dashboard** — Total expenses, current/previous month totals, transaction count, recent expenses, expenses-by-category chart, and a 6-month expense trend chart.
- **Search & Filtering** — Search by description, filter by category/date range/amount range, and sort by description, category, date, or amount.
- **Modern UI** — Responsive layout, sidebar + navbar, dark mode, loading/empty/error states, confirmation dialogs, and toast notifications.

## Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 16 (App Router)                      |
| UI           | React 19, Tailwind CSS v4                    |
| Language     | TypeScript                                   |
| Database     | MySQL                                        |
| ORM          | Prisma 7 (with `@prisma/adapter-mariadb`)    |
| Auth         | `jose` (JWT) + `bcryptjs` (hashing)          |
| Charts       | Recharts                                     |
| Theme        | `next-themes`                                |
| Toasts       | `sonner`                                     |
| Validation   | `zod`                                        |

## Requirements

- Node.js 20.9+ (Node 24 recommended)
- MySQL 8+ server running and reachable
- npm (or pnpm/yarn)

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd expense-tracker

# 2. Install dependencies
npm install
```

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable          | Description                                                       |
| ----------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`    | MySQL connection string used by Prisma CLI/migrations           |
| `DATABASE_HOST`   | MySQL host (used by the runtime driver adapter)                 |
| `DATABASE_USER`   | MySQL user                                                       |
| `DATABASE_PASSWORD` | MySQL password                                                 |
| `DATABASE_NAME`   | MySQL database name                                              |
| `DATABASE_PORT`   | MySQL port (default `3306`)                                      |
| `AUTH_SECRET`     | Long random string (min 16 chars) used to sign session JWTs     |

Example:

```env
DATABASE_URL="mysql://root:password@localhost:3306/expense_tracker"
DATABASE_HOST="localhost"
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="expense_tracker"
DATABASE_PORT=3306
AUTH_SECRET="replace-with-a-long-random-secret-string"
```

> Never commit your real `.env` file. It is git-ignored.

## Database Setup

```bash
# Create the database tables (applies the migration in prisma/migrations)
npm run db:migrate

# (Optional) Seed the default categories
npm run db:seed
```

If you prefer to apply the schema directly without migration history:

```bash
npm run db:push
```

## Running the Project

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
expense-tracker/
├── prisma/
│   ├── schema.prisma          # Prisma models (User, Expense, Category)
│   ├── seed.ts                # Seeds default categories
│   └── migrations/            # SQL migrations
├── generated/prisma/          # Generated Prisma Client (git-ignored)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & Register pages (public)
│   │   ├── (dashboard)/       # Dashboard & Expenses (protected)
│   │   ├── actions/           # Server actions (auth, expenses)
│   │   ├── page.tsx           # Root redirect
│   │   └── layout.tsx         # Root layout (theme + toasts)
│   ├── components/
│   │   ├── ui/                # Button, Card, Input, Badge, ConfirmDialog
│   │   ├── auth/              # Login/Register forms
│   │   ├── layout/            # DashboardShell (sidebar + navbar)
│   │   ├── charts/            # Recharts wrappers
│   │   ├── dashboard/         # StatCard
│   │   └── expenses/          # Toolbar, Table, Form, Recent list
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton (driver adapter)
│   │   ├── auth.ts            # Password hashing + session JWT
│   │   ├── session.ts         # Current user resolver
│   │   ├── expenses.ts        # Expense data-access layer
│   │   ├── dashboard.ts       # Dashboard stats queries
│   │   ├── validation.ts      # Zod schemas
│   │   ├── constants.ts       # Default categories
│   │   └── utils.ts           # Formatting helpers
│   └── types/                 # Shared TypeScript types
├── middleware.ts              # Route protection
├── prisma.config.ts          # Prisma CLI config
└── .env.example
```

## Architecture Notes

- **Concern separation** — UI components, server actions, database access (`lib/expenses.ts`, `lib/dashboard.ts`), validation (`lib/validation.ts`), auth (`lib/auth.ts`), and types are kept in separate modules.
- **Data isolation** — Every query scopes results by `userId`. Users can never read or modify another user's data.
- **Security** — Passwords are hashed with bcrypt; sessions are signed JWTs stored in HTTP-only cookies; all inputs are validated with Zod on the server; secrets come from environment variables only.

## Future Improvements

- Export expenses to CSV/PDF.
- Recurring expenses and budgeting limits.
- Editable/deletable categories with per-user custom categories.
- Multi-currency support and localized formatting.
- Pagination cursor optimization and server-side caching.
- End-to-end and integration tests (Vitest + Playwright).
- Account settings (change password, delete account).

## License

This project is provided as-is for learning purposes.
