"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input, Select, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/components/locale-provider";
import { translateCategory } from "@/lib/i18n";
import type { Category } from "@generated/prisma/client";
import type { ExpenseFilters } from "@/types";

type CategoryLite = Pick<Category, "id" | "name" | "slug">;

export function ExpensesToolbar({
  categories,
  filters,
}: {
  categories: CategoryLite[];
  filters: ExpenseFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useTranslations();

  const [search, setSearch] = useState(filters.search ?? "");
  const [categoryId, setCategoryId] = useState(filters.categoryId ?? "");
  const [from, setFrom] = useState(filters.from ?? "");
  const [to, setTo] = useState(filters.to ?? "");
  const [minAmount, setMinAmount] = useState(filters.minAmount?.toString() ?? "");
  const [maxAmount, setMaxAmount] = useState(filters.maxAmount?.toString() ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (minAmount) params.set("minAmount", minAmount);
    if (maxAmount) params.set("maxAmount", maxAmount);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    setSearch("");
    setCategoryId("");
    setFrom("");
    setTo("");
    setMinAmount("");
    setMaxAmount("");
    router.push(pathname);
  }

  return (
    <form
      onSubmit={apply}
      className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      <div className="xl:col-span-2">
        <Label htmlFor="search">{t("filter.search")}</Label>
        <Input
          id="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("filter.searchPlaceholder")}
        />
      </div>
      <div>
        <Label htmlFor="category">{t("filter.category")}</Label>
        <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{t("filter.all")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {translateCategory(locale, c.slug, c.name)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="from">{t("filter.from")}</Label>
        <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="to">{t("filter.to")}</Label>
        <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit">{t("action.filter")}</Button>
        <Button type="button" variant="secondary" onClick={reset}>
          {t("action.reset")}
        </Button>
      </div>
      <div className="flex gap-2 xl:col-span-2">
        <div className="flex-1">
          <Label htmlFor="minAmount">{t("filter.minAmount")}</Label>
          <Input
            id="minAmount"
            type="number"
            step="0.01"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="maxAmount">{t("filter.maxAmount")}</Label>
          <Input
            id="maxAmount"
            type="number"
            step="0.01"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="1000"
          />
        </div>
      </div>
    </form>
  );
}
