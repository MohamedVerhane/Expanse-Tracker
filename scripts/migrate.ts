import "dotenv/config";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { isRemoteDatabaseUrl, resolveDatabaseUrl } from "../src/lib/db-url";

const MIGRATIONS_DIR = "prisma/migrations";

/**
 * `_prisma_migrations` is the table `prisma migrate` uses to track what it has
 * applied. Prisma Migrate cannot talk to libSQL, so remote databases are
 * migrated by applying the same SQL files and recording them here, which keeps
 * the bookkeeping identical to a local database.
 */
const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  id TEXT PRIMARY KEY NOT NULL,
  checksum TEXT NOT NULL,
  finished_at TIMESTAMP,
  migration_name TEXT NOT NULL,
  logs TEXT,
  rolled_back_at TIMESTAMP,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  applied_steps_count INTEGER UNSIGNED NOT NULL DEFAULT 0
)`;

function migrationDirectories(): string[] {
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Splits a migration file into statements.
 *
 * A plain `split(";")` would corrupt any migration containing a semicolon
 * inside a string literal, and would let a semicolon inside a `--` comment
 * swallow the statement that follows it, so both are tracked.
 */
export function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let quote: string | null = null;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (quote) {
      if (char === quote) quote = null;
      current += char;
      continue;
    }

    if (char === "-" && next === "-") {
      while (i < sql.length && sql[i] !== "\n") i += 1;
      current += "\n";
      continue;
    }

    if (char === "/" && next === "*") {
      i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }

    if (char === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) statements.push(current.trim());

  return statements;
}

async function appliedMigrations(client: Client): Promise<Set<string>> {
  await client.execute(MIGRATIONS_TABLE);

  const result = await client.execute(
    'SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL',
  );

  return new Set(result.rows.map((row) => String(row[0])));
}

export async function applyMigrations(
  url: string,
  authToken?: string,
): Promise<number> {
  const client = createClient({ url, authToken });
  const applied = await appliedMigrations(client);
  let count = 0;

  for (const name of migrationDirectories()) {
    if (applied.has(name)) continue;

    const file = path.join(MIGRATIONS_DIR, name, "migration.sql");
    const sql = readFileSync(file, "utf8");
    const statements = splitStatements(sql);

    // `batch` runs in a single transaction, so a failure leaves no half-applied
    // migration behind.
    await client.batch(
      [
        ...statements,
        {
          sql: 'INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, finished_at, applied_steps_count) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)',
          args: [
            name,
            createHash("sha256").update(sql).digest("hex"),
            name,
            statements.length,
          ],
        },
      ],
      "write",
    );

    console.log(`[migrate] applied ${name} (${statements.length} statements)`);
    count += 1;
  }

  client.close();

  return count;
}

function deployLocalMigrations(): void {
  const bin = path.join(
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prisma.cmd" : "prisma",
  );

  const result = spawnSync(bin, ["migrate", "deploy"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  process.exit(result.status ?? 1);
}

async function main() {
  const url = resolveDatabaseUrl();

  if (!isRemoteDatabaseUrl(url)) {
    deployLocalMigrations();
    return;
  }

  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!authToken) {
    throw new Error(
      "DATABASE_AUTH_TOKEN is required for a libsql:// DATABASE_URL. " +
        "Create a token with `turso db tokens create <name>`.",
    );
  }

  const count = await applyMigrations(url, authToken);
  console.log(`[migrate] ${count} migration(s) applied to the remote database`);
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
