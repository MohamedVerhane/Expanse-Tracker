import fs from "node:fs";
import path from "node:path";

const DEFAULT_DATABASE_URL = "file:./prisma/dev.db";

/**
 * Resolves a `file:` URL to an absolute path.
 *
 * Relative paths in SQLite are otherwise interpreted against the current
 * working directory, which differs between the Prisma CLI, `next dev` and
 * `next start`. Anchoring to the project root keeps every process on the same
 * database file.
 *
 * `turbopackIgnore` opts out of file tracing: the database location is a
 * runtime value, not a module the bundler should follow.
 */
function absolutePath(file: string): string {
  if (path.isAbsolute(file)) return file;

  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), file);
}

function sqliteFilePath(url: string): string | null {
  if (url === "file::memory:") return null;
  if (!url.startsWith("file:")) return null;

  return url.slice("file:".length);
}

/** Remote libSQL/Turso URLs, which are served over the network. */
export function isRemoteDatabaseUrl(url: string): boolean {
  return (
    url.startsWith("libsql://") ||
    url.startsWith("https://") ||
    url.startsWith("wss://")
  );
}

/** The database URL for the SQLite dialect: local `file:` or remote libSQL. */
export function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;

  if (url === "file::memory:") return url;
  if (isRemoteDatabaseUrl(url)) return url;

  if (!url.startsWith("file:")) {
    // Without this the driver would treat e.g. "mysql://user:pass@host/db" as a
    // literal filename and fail much later with a confusing error.
    throw new Error(
      `DATABASE_URL must be a SQLite "file:" URL or a libSQL "libsql://" URL, but got: ${url}\n` +
        `This app uses SQLite. For a local database or a single server with a ` +
        `persistent volume, set DATABASE_URL="file:./prisma/dev.db" ` +
        `(e.g. "file:/data/expense-tracker.db").\n` +
        `For serverless hosting such as Vercel, use a hosted libSQL database: ` +
        `DATABASE_URL="libsql://your-db.turso.io" plus DATABASE_AUTH_TOKEN.`,
    );
  }

  return `file:${absolutePath(url.slice("file:".length))}`;
}

/** Absolute path of the database file, or null for an in-memory database. */
export function databaseFilePath(url: string): string | null {
  if (url === "file::memory:") return null;

  const file = sqliteFilePath(url);
  return file ? absolutePath(file) : null;
}

/** Creates the parent directory so SQLite can create a missing database file. */
export function ensureDatabaseDirectory(url: string): void {
  const file = databaseFilePath(url);
  if (file) fs.mkdirSync(path.dirname(file), { recursive: true });
}
