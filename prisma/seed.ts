import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { DEFAULT_CATEGORIES } from "../src/lib/constants";

async function main() {

  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, color: category.color },
      create: category,
    });
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
