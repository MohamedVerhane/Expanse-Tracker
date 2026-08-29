"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { createExpense, updateExpense, deleteExpense } from "@/lib/expenses";
import { expenseSchema } from "@/lib/validation";

export type ExpenseState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function flatten(error: import("zod").ZodError): Record<string, string> {
  const flat = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const result: Record<string, string> = {};
  for (const key of Object.keys(flat)) {
    const value = flat[key];
    if (value && value.length > 0) result[key] = value[0];
  }
  return result;
}

export async function createExpenseAction(_prev: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const user = await safeUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error) };
  }

  await createExpense(user.id, parsed.data);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateExpenseAction(_prev: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const user = await safeUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const id = String(formData.get("id") ?? "");
  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error) };
  }

  const updated = await updateExpense(user.id, id, parsed.data);
  if (!updated) return { error: "Expense not found." };

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpenseAction(formData: FormData): Promise<void> {
  const user = await safeUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  await deleteExpense(user.id, id);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

async function safeUser() {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}
