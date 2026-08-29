"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "@/components/locale-provider";

export function MonthlyChart({ data }: { data: { month: string; label: string; total: number }[] }) {
  const { dir } = useTranslations();
  const isRtl = dir === "rtl";

  return (
    <div dir="ltr" className="w-full">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            className="text-xs fill-slate-500"
            reversed={isRtl}
            padding={{ left: isRtl ? 0 : 16, right: isRtl ? 16 : 0 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            className="text-xs fill-slate-500"
            orientation={isRtl ? "right" : "left"}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
          <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
