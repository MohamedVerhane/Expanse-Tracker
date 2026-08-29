"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { createExpenseAction, updateExpenseAction, type ExpenseState } from "@/app/actions/expenses";
import type { Category } from "@generated/prisma/client";
import type { SerializableExpense } from "@/types";
import { todayInputValue } from "@/lib/utils";
import { useTranslations } from "@/components/locale-provider";
import { translateCategory } from "@/lib/i18n";

type CategoryLite = Pick<Category, "id" | "name" | "slug">;
type ExpenseDTO = SerializableExpense & { amount: number };

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useTranslations();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("form.saving") : editing ? t("action.save") : t("action.addExpense")}
    </Button>
  );
}

export function ExpenseForm({
  categories,
  expense,
  onDone,
}: {
  categories: CategoryLite[];
  expense?: ExpenseDTO | null;
  onDone: () => void;
}) {
  const editing = Boolean(expense);
  const action = editing ? updateExpenseAction : createExpenseAction;
  const [state, formAction] = useActionState<ExpenseState, FormData>(action, {});
  const { t, locale } = useTranslations();

  useEffect(() => {
    if (state.success) {
      toast.success(editing ? t("toast.updated") : t("toast.added"));
      onDone();
    }
  }, [state.success, editing, onDone, t]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <form
        action={formAction}
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
      >
        <h2 className="mb-4 text-lg font-semibold">{editing ? t("form.editTitle") : t("form.addTitle")}</h2>

        {expense && <input type="hidden" name="id" value={expense.id} />}

        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">{t("form.amount")}</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={expense ? String(expense.amount) : ""}
              placeholder="0.00"
              required
            />
            {state.fieldErrors?.amount && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.amount}</p>}
          </div>
          <div>
            <Label htmlFor="description">{t("form.description")}</Label>
            <Input
              id="description"
              name="description"
              defaultValue={expense?.description ?? ""}
              placeholder={t("form.placeholder.description")}
              required
            />
            {state.fieldErrors?.description && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.description}</p>
            )}
          </div>
          <div>
            <Label htmlFor="categoryId">{t("form.category")}</Label>
            <Select id="categoryId" name="categoryId" defaultValue={expense?.categoryId ?? ""} required>
              <option value="" disabled>
                {t("form.placeholder.category")}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {translateCategory(locale, c.slug, c.name)}
                </option>
              ))}
            </Select>
            {state.fieldErrors?.categoryId && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.categoryId}</p>
            )}
          </div>
          <div>
            <Label htmlFor="date">{t("form.date")}</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={expense ? new Date(expense.date).toISOString().slice(0, 10) : todayInputValue()}
              required
            />
            {state.fieldErrors?.date && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.date}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onDone}>
            {t("action.cancel")}
          </Button>
          <SubmitButton editing={editing} />
        </div>
      </form>
    </div>
  );
}
