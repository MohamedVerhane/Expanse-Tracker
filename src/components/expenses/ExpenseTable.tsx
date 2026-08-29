"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExpenseForm } from "./ExpenseForm";
import { deleteExpenseAction } from "@/app/actions/expenses";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslations } from "@/components/locale-provider";
import { translateCategory } from "@/lib/i18n";
import type { Category } from "@generated/prisma/client";
import type { SerializableExpense, SortField, SortOrder } from "@/types";

type CategoryLite = Pick<Category, "id" | "name" | "slug">;
type ExpenseDTO = SerializableExpense & { amount: number };

const COLUMN_KEYS: { key: SortField; labelKey: string }[] = [
  { key: "description", labelKey: "table.description" },
  { key: "category", labelKey: "table.category" },
  { key: "date", labelKey: "table.date" },
  { key: "amount", labelKey: "table.amount" },
];

export function ExpenseTable({
  items,
  categories,
  page,
  totalPages,
  sortBy,
  sortOrder,
}: {
  items: ExpenseDTO[];
  categories: CategoryLite[];
  page: number;
  totalPages: number;
  sortBy: SortField;
  sortOrder: SortOrder;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslations();

  const [editing, setEditing] = useState<ExpenseDTO | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  function buildUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    return `${pathname}?${params.toString()}`;
  }

  function toggleSort(key: SortField) {
    const nextOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    router.push(buildUrl({ sortBy: key, sortOrder: nextOrder, page: "1" }));
  }

  function goToPage(next: number) {
    router.push(buildUrl({ page: String(next) }));
  }

  function confirmDelete() {
    if (pendingDelete) {
      const input = deleteFormRef.current?.querySelector('input[name="id"]') as HTMLInputElement | null;
      if (input) input.value = pendingDelete;
      deleteFormRef.current?.requestSubmit();
      toast.success(t("toast.deleted"));
    }
    router.refresh();
    setPendingDelete(null);
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <form ref={deleteFormRef} action={deleteExpenseAction} className="hidden">
        <input type="hidden" name="id" />
      </form>

      <div className="flex justify-end p-4">
        <Button onClick={() => setShowCreate(true)}>+ {t("action.addExpense")}</Button>
      </div>

      {items.length === 0 ? (
        <div className="px-4 pb-10 pt-4 text-center">
          <p className="text-sm text-muted">{t("expenses.empty")}</p>
          <p className="mt-1 text-xs text-muted">{t("expenses.emptyHint")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase text-muted">
                {COLUMN_KEYS.map((col) => (
                  <th key={col.key} className="px-4 py-3">
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 font-medium hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {t(col.labelKey)}
                      {sortBy === col.key && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">{expense.description}</td>
                  <td className="px-4 py-3">
                    <Badge color={expense.category.color}>
                      {translateCategory(locale, expense.category.slug, expense.category.name)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(expense.date)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(expense.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(expense)}>
                        {t("action.edit")}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setPendingDelete(expense.id)}>
                        {t("action.delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span className="text-muted">{t("pagination.pageOf", { page: String(page), total: String(totalPages) })}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              {t("action.previous")}
            </Button>
            <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              {t("action.next")}
            </Button>
          </div>
        </div>
      )}

      {showCreate && (
        <ExpenseForm categories={categories} onDone={() => { setShowCreate(false); router.refresh(); }} />
      )}
      {editing && (
        <ExpenseForm categories={categories} expense={editing} onDone={() => { setEditing(null); router.refresh(); }} />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("confirm.title")}
        description={t("confirm.description")}
        confirmLabel={t("action.delete")}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
