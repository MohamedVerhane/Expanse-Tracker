import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../../generated/prisma/client";
import {
  ensureDatabaseDirectory,
  isRemoteDatabaseUrl,
  resolveDatabaseUrl,
} from "./db-url";
import { DEFAULT_CATEGORIES } from "./constants";

const prismaClientSingleton = () => {
  const url = resolveDatabaseUrl();

  if (isRemoteDatabaseUrl(url)) {
    // Hosted libSQL (Turso): the data lives outside this process, so the app
    // works on hosts with a read-only and ephemeral filesystem such as Vercel.
    return new PrismaClient({
      adapter: new PrismaLibSql({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }),
    });
  }

  ensureDatabaseDirectory(url);

  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

let seedPromise: Promise<void> | null = null;

export function seedDefaultCategories(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      for (const category of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: { slug: category.slug },
          update: { name: category.name, color: category.color },
          create: { ...category },
        });
      }
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
