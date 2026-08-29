import type { Expense, Category, User } from "../../generated/prisma/client";

export type ExpenseWithCategory = Expense & {
  category: Pick<Category, "id" | "name" | "slug" | "color">;
};

export type SerializableExpense = Omit<ExpenseWithCategory, "amount"> & { amount: number };

export type SafeUser = Omit<User, "password">;

export type SortField = "date" | "amount" | "description" | "category";
export type SortOrder = "asc" | "desc";

export type ExpenseFilters = {
  search?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
};

export type DashboardStats = {
  totalExpenses: number;
  currentMonth: number;
  previousMonth: number;
  transactionCount: number;
  recentExpenses: SerializableExpense[];
  byCategory: { category: string; slug: string; color: string; total: number }[];
  monthly: { month: string; label: string; total: number }[];
};
