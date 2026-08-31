import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";
import { DEFAULT_CATEGORIES } from "./constants";

const prismaClientSingleton = () => {
  const databaseName = process.env.DATABASE_NAME ?? getDbName(process.env.DATABASE_URL);

  const connectionConfig =
    process.env.DATABASE_URL ??
    `mysql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${databaseName}`;

  const adapter = new PrismaMariaDb(connectionConfig, {
    database: databaseName,
  });

  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

function getDbName(url?: string): string {
  if (!url) return "defaultdb";
  try {
    return new URL(url).pathname.replace(/^\//, "") || "defaultdb";
  } catch {
    return "defaultdb";
  }
}

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
