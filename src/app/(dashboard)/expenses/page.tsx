import { requireUser } from "@/lib/session";
import { getExpenses, getCategories } from "@/lib/expenses";
import { ExpensesToolbar } from "@/components/expenses/ExpensesToolbar";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import type { ExpenseFilters, SortField, SortOrder } from "@/types";
import { getLocale } from "@/lib/locale";
import { translate } from "@/lib/i18n";

type SearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const locale = await getLocale();
  const t = (key: string) => translate(locale, key);

  const filters: ExpenseFilters = {
    search: str(params.search),
    categoryId: str(params.categoryId),
    from: str(params.from),
    to: str(params.to),
    minAmount: str(params.minAmount) ? Number(str(params.minAmount)) : undefined,
    maxAmount: str(params.maxAmount) ? Number(str(params.maxAmount)) : undefined,
    sortBy: (str(params.sortBy) as SortField) || "date",
    sortOrder: (str(params.sortOrder) as SortOrder) || "desc",
    page: Math.max(1, Number(str(params.page)) || 1),
  };

  const [result, categories] = await Promise.all([
    getExpenses(user.id, filters),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("expenses.title")}</h1>
          <p className="text-sm text-muted">
            {result.total} {t("expenses.count")}
          </p>
        </div>
      </div>

      <ExpensesToolbar categories={categories} filters={filters} />

      <ExpenseTable
        items={result.items}
        categories={categories}
        page={result.page}
        totalPages={result.totalPages}
        sortBy={filters.sortBy ?? "date"}
        sortOrder={filters.sortOrder ?? "desc"}
      />
    </div>
  );
}
