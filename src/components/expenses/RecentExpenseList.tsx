import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLocale } from "@/lib/locale";
import { translate, translateCategory } from "@/lib/i18n";
import type { SerializableExpense } from "@/types";

export async function RecentExpenseList({ items }: { items: SerializableExpense[] }) {
  const locale = await getLocale();
  const t = (key: string) => translate(locale, key);

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">{t("recent.empty")}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((expense) => (
        <li key={expense.id} className="flex items-center justify-between py-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{expense.description}</p>
            <p className="text-xs text-muted">
              {formatDate(expense.date)} ·{" "}
              <Badge color={expense.category.color}>
                {translateCategory(locale, expense.category.slug, expense.category.name)}
              </Badge>
            </p>
          </div>
          <span className="ml-4 font-semibold">{formatCurrency(expense.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
