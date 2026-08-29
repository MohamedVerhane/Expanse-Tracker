import "server-only";
import { prisma } from "./prisma";
import { Prisma } from "@generated/prisma/client";
import type { ExpenseFilters } from "@/types";
import type { ExpenseWithCategory, SerializableExpense } from "@/types";

function toSerializable(expense: ExpenseWithCategory): SerializableExpense {
  return { ...expense, amount: expense.amount.toNumber() };
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getExpenses(userId: string, filters: ExpenseFilters = {}) {
  const {
    search,
    categoryId,
    from,
    to,
    minAmount,
    maxAmount,
    sortBy = "date",
    sortOrder = "desc",
    page = 1,
  } = filters;

  const where: Prisma.ExpenseWhereInput = { userId };

  if (categoryId) where.categoryId = categoryId;

  if (search) {
    where.description = { contains: search };
  }

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    where.amount = {};
    if (minAmount !== undefined) where.amount.gte = minAmount;
    if (maxAmount !== undefined) where.amount.lte = maxAmount;
  }

  const orderBy: Prisma.ExpenseOrderByWithRelationInput = { [sortBy]: sortOrder };

  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true, color: true } } },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    items: items.map(toSerializable) as SerializableExpense[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getExpenseById(userId: string, id: string) {
  const expense = await prisma.expense.findFirst({
    where: { id, userId },
    include: { category: { select: { id: true, name: true, slug: true, color: true } } },
  });
  return expense ? (toSerializable(expense) as SerializableExpense) : null;
}

export async function createExpense(
  userId: string,
  data: { amount: number; description: string; categoryId: string; date: string },
) {
  const expense = await prisma.expense.create({
    data: {
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      categoryId: data.categoryId,
      userId,
    },
    include: { category: { select: { id: true, name: true, slug: true, color: true } } },
  });
  return toSerializable(expense);
}

export async function updateExpense(
  userId: string,
  id: string,
  data: { amount: number; description: string; categoryId: string; date: string },
) {
  const existing = await prisma.expense.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      categoryId: data.categoryId,
    },
    include: { category: { select: { id: true, name: true, slug: true, color: true } } },
  });
  return toSerializable(expense);
}

export async function deleteExpense(userId: string, id: string) {
  const existing = await prisma.expense.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.expense.delete({ where: { id } });
  return true;
}
