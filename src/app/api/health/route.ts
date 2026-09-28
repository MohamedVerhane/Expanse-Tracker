import { NextResponse } from "next/server";
import {
  isRemoteDatabaseUrl,
  redactDatabaseUrl,
  resolveDatabaseUrl,
} from "@/lib/db-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redactMessage(message: string, token: string | undefined): string {
  let safe = message;

  if (token) safe = safe.split(token).join("***");
  if (safe.length > 500) safe = `${safe.slice(0, 500)}…`;

  return redactDatabaseUrl(safe);
}

/**
 * Reports whether the app can actually reach its database.
 *
 * A deployment can build and boot and still fail every request, and the error
 * page in production hides the reason behind a `Reference:` code. This endpoint
 * reports the cause directly.
 *
 * Set `HEALTH_INCLUDE_ERROR=1` to include the underlying error message; it is
 * withheld by default so the endpoint stays safe to expose publicly.
 */
export async function GET() {
  const includeError = process.env.HEALTH_INCLUDE_ERROR === "1";
  const token = process.env.DATABASE_AUTH_TOKEN;

  // A misconfigured DATABASE_URL throws here, which is the most likely reason
  // for the failure this endpoint exists to report, so it must not escape.
  let url: string;
  try {
    url = resolveDatabaseUrl();
  } catch (error) {
    const body: Record<string, unknown> = {
      mode: "invalid",
      reachable: false,
      categories: null,
    };

    if (includeError) {
      body.error = redactMessage(
        error instanceof Error ? error.message : String(error),
        token,
      );
    }

    return NextResponse.json(body, { status: 500, headers: { "cache-control": "no-store" } });
  }

  const remote = isRemoteDatabaseUrl(url);

  const body: Record<string, unknown> = {
    mode: remote ? "libsql" : "file",
    database: redactDatabaseUrl(url),
    authTokenPresent: Boolean(token),
    reachable: false,
    categories: null,
  };

  try {
    // Imported lazily: `@/lib/prisma` resolves the URL when the module loads,
    // which would throw during import rather than inside this handler.
    const { prisma } = await import("@/lib/prisma");
    const categories = await prisma.category.count();
    body.reachable = true;
    body.categories = categories;
  } catch (error) {
    if (includeError) {
      body.error = redactMessage(
        error instanceof Error ? error.message : String(error),
        token,
      );
    }
  }

  return NextResponse.json(body, {
    status: body.reachable ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}

