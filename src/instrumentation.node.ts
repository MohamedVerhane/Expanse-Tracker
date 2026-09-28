import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import {
  databaseFilePath,
  isRemoteDatabaseUrl,
  redactDatabaseUrl,
  resolveDatabaseUrl,
} from "./lib/db-url";

/**
 * Runs once when the Node.js server starts.
 *
 * Verifies the database is reachable and, for a local file, that its directory
 * is actually writable. On a serverless host the read succeeds while every write
 * is silently discarded, which is much harder to diagnose than a hard failure.
 */
export async function register() {
  // Nothing here may throw: a failing instrumentation hook stops the whole
  // server from starting, which would leave no way to report the very problem
  // this function exists to report.
  try {
    await checkDatabase();
  } catch (error) {
    console.error("[db] Startup check failed:", error);
  }
}

async function checkDatabase(): Promise<void> {
  const url = resolveDatabaseUrl();
  const file = databaseFilePath(url);
  const remote = isRemoteDatabaseUrl(url);

  console.log(`[db] DATABASE_URL resolved to: ${redactDatabaseUrl(url)}`);
  console.log(
    remote
      ? "[db] Using hosted libSQL over HTTP" +
          (process.env.DATABASE_AUTH_TOKEN ? "" : " (DATABASE_AUTH_TOKEN is MISSING)")
      : `[db] Using a local SQLite file at ${file}`,
  );

  try {
    const { prisma } = await import("./lib/prisma");
    console.log(`[db] Connection OK. ${await prisma.category.count()} categories.`);
  } catch (error) {
    console.error("[db] Connection FAILED:", error);
  }

  if (file && !(await isWritable(file))) {
    console.error(
      `[db] WARNING: ${file} is on a filesystem that is not writable.\n` +
        `Mount a persistent volume there, otherwise every write is lost ` +
        `(this is what happens on Vercel and other serverless hosts).`,
    );
  }
}

async function isWritable(file: string): Promise<boolean> {
  const probe = join(dirname(file), `.write-probe-${process.pid}`);

  try {
    await fs.writeFile(probe, "");
    await fs.unlink(probe);
    return true;
  } catch {
    return false;
  }
}
