import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { ensureDatabaseDirectory, resolveDatabaseUrl } from "./db-url";
import { DEFAULT_CATEGORIES } from "./constants";

const prismaClientSingleton = () => {
  const url = resolveDatabaseUrl();

  ensureDatabaseDirectory(url);

  const adapter = new PrismaBetterSqlite3({ url });

  return new PrismaClient({ adapter });
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
