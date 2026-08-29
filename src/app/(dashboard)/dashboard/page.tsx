import { requireUser } from "@/lib/session";
import { getDashboardStats } from "@/lib/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { MonthlyChart } from "@/components/charts/MonthlyChart";
import { RecentExpenseList } from "@/components/expenses/RecentExpenseList";
import { formatCurrency } from "@/lib/utils";
import { getLocale } from "@/lib/locale";
import { translate, translateCategory } from "@/lib/i18n";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await getDashboardStats(user.id);
  const locale = await getLocale();
  const t = (key: string) => translate(locale, key);

  const monthDelta = stats.currentMonth - stats.previousMonth;
  const monthTrend = monthDelta > 0 ? "up" : monthDelta < 0 ? "down" : "neutral";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted">{t("dashboard.subtitle")}</p>
        </div>
        <Link href="/expenses">
          <Button>{t("action.viewExpenses")}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FadeIn delay={0}>
          <StatCard label={t("stat.total")} value={formatCurrency(stats.totalExpenses)} />
        </FadeIn>
        <FadeIn delay={0.05}>
          <StatCard
            label={t("stat.thisMonth")}
            value={formatCurrency(stats.currentMonth)}
            hint={
              stats.previousMonth > 0
                ? `${monthDelta >= 0 ? "+" : ""}${formatCurrency(monthDelta)} vs last month`
                : t("stat.noDataLastMonth")
            }
            trend={monthTrend}
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <StatCard label={t("stat.lastMonth")} value={formatCurrency(stats.previousMonth)} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <StatCard label={t("stat.transactions")} value={String(stats.transactionCount)} />
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FadeIn delay={0.2} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("chart.monthly")}</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart data={stats.monthly} />
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.25}>
          <Card>
            <CardHeader>
              <CardTitle>{t("chart.byCategory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart
                data={stats.byCategory.map((c) => ({
                  ...c,
                  category: translateCategory(locale, c.slug, c.category),
                }))}
              />
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.3}>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{t("recent.title")}</CardTitle>
            <Link href="/expenses" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              {t("action.seeAll")}
            </Link>
          </CardHeader>
          <CardContent>
            <RecentExpenseList items={stats.recentExpenses} />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
