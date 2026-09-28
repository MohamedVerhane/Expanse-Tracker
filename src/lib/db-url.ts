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

/** The absolute `file:` URL for the SQLite database. */
export function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;

  if (url === "file::memory:") return url;

  if (!url.startsWith("file:")) {
    // Without this the driver would treat e.g. "mysql://user:pass@host/db" as a
    // literal filename and fail much later with a confusing error.
    throw new Error(
      `DATABASE_URL must be a SQLite "file:" URL, but got: ${url}\n` +
        `This app uses SQLite, which stores everything in a single local file.\n` +
        `Set DATABASE_URL="file:./prisma/dev.db" (or an absolute path on a ` +
        `persistent volume, e.g. "file:/data/expense-tracker.db").\n` +
        `Note: SQLite cannot run on Vercel or any other serverless host, ` +
        `because the filesystem is read-only and discarded after each request.`,
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
