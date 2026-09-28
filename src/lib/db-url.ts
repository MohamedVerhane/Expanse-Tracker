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
function absolutePath(url: string): string {
  const file = url.slice("file:".length);
  if (path.isAbsolute(file)) return file;

  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), file);
}

function isFileUrl(url: string): boolean {
  return url.startsWith("file:") && url !== "file::memory:";
}

/** The absolute `file:` URL for the SQLite database. */
export function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
  if (!isFileUrl(url)) return url;

  return `file:${absolutePath(url)}`;
}

/** Creates the parent directory so SQLite can create a missing database file. */
export function ensureDatabaseDirectory(url: string): void {
  if (!isFileUrl(url)) return;

  fs.mkdirSync(path.dirname(absolutePath(url)), { recursive: true });
}
