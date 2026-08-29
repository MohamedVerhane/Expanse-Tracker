import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { DEFAULT_CATEGORIES } from "../src/lib/constants";
import bcrypt from "bcryptjs";

const DESCRIPTIONS = [
  "Groceries", "Bus ticket", "Coffee", "Lunch", "Dinner", "Taxi", "Train pass",
  "Electricity bill", "Water bill", "Internet", "Mobile top-up", "Textbook",
  "Online course", "Movie ticket", "Concert", "Game", "T-shirt", "Shoes",
  "Groceries", "Pharmacy", "Doctor visit", "Gym membership", "Notebook",
  "Pizza", "Bakery", "Fuel", "Parking", "Subscription", "Gift",
];

const FIRST_NAMES = [
  "Alex", "Sara", "John", "Maya", "Omar", "Lina", "Yusuf", "Noor", "Leo", "Emma",
  "Karim", "Hana", "Tom", "Zoe", "Ali", "Mona", "Sam", "Layla", "Ben", "Nadia",
];

const LAST_NAMES = [
  "Smith", "Jones", "Khan", "Lee", "Brown", "Ali", "Novak", "Haddad", "Cole", "Reed",
  "Farid", "Said", "Wong", "Best", "Diaz", "Cook", "Rao", "Amin", "Fox", "Nassar",
];

const TOTAL_USERS = 20;
const TOTAL_EXPENSES = 10000;
const CHUNK = 1000;
const DEMO_PASSWORD = "Password123!";

async function seedCategories() {
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Ensuring categories exist...");
  await seedCategories();
  const categories = await prisma.category.findMany();
  const categoryIds = categories.map((c) => c.id);

  console.log(`Creating ${TOTAL_USERS} users...`);
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);
  const users = [];
  for (let i = 0; i < TOTAL_USERS; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const email = `user${i + 1}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, password: hashed },
    });
    users.push(user);
  }

  console.log(`Creating ${TOTAL_EXPENSES} expenses...`);
  const now = Date.now();
  const DAY = 86_400_000;
  let created = 0;

  for (let start = 0; start < TOTAL_EXPENSES; start += CHUNK) {
    const end = Math.min(start + CHUNK, TOTAL_EXPENSES);
    const batch = [];
    for (let j = start; j < end; j++) {
      const user = pick(users);
      const categoryId = pick(categoryIds);
      const amount = Math.round((Math.random() * 499 + 1) * 100) / 100;
      const daysAgo = Math.floor(Math.random() * 180);
      const date = new Date(now - daysAgo * DAY);
      const description = pick(DESCRIPTIONS);
      batch.push({ userId: user.id, categoryId, amount, description, date });
    }
    await prisma.expense.createMany({ data: batch });
    created += batch.length;
    console.log(`  ${created}/${TOTAL_EXPENSES} expenses created`);
  }

  console.log("Demo data created successfully.");
  console.log(`Login with any user1..user${TOTAL_USERS}@example.com / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
