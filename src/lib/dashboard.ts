import "server-only";
import { prisma } from "./prisma";
import { getMonthKey } from "./utils";
import type { DashboardStats, SerializableExpense } from "@/types";

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [totalAgg, currentAgg, prevAgg, count, recent, categories, monthlyRaw] = await Promise.all([
    prisma.expense.aggregate({ _sum: { amount: true }, where: { userId } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { userId, date: { gte: startOfMonth } } }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { userId, date: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
    }),
    prisma.expense.count({ where: { userId } }),
    prisma.expense.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true, slug: true, color: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      _sum: { amount: true },
      where: { userId },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      select: { date: true, amount: true },
    }),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.categoryId, c._sum.amount?.toNumber() ?? 0]));
  const categoryDetails = await prisma.category.findMany();
  const byCategory = categoryDetails
    .map((c) => ({
      category: c.name,
      slug: c.slug,
      color: c.color,
      total: categoryMap.get(c.id) ?? 0,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const monthBuckets = new Map<string, number>();
  for (const e of monthlyRaw) {
    const key = getMonthKey(new Date(e.date));
    monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + e.amount.toNumber());
  }

  const monthly: DashboardStats["monthly"] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = getMonthKey(d);
    monthly.push({
      month: key,
      label: d.toLocaleString("en-US", { month: "short" }),
      total: monthBuckets.get(key) ?? 0,
    });
  }

  return {
    totalExpenses: totalAgg._sum.amount?.toNumber() ?? 0,
    currentMonth: currentAgg._sum.amount?.toNumber() ?? 0,
    previousMonth: prevAgg._sum.amount?.toNumber() ?? 0,
    transactionCount: count,
    recentExpenses: recent.map((r) => ({ ...r, amount: r.amount.toNumber() })) as SerializableExpense[],
    byCategory,
    monthly,
  };
}
