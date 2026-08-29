"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function CategoryChart({
  data,
}: {
  data: { category: string; slug: string; color: string; total: number }[];
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">No expenses yet.</p>;
  }

  return (
    <div dir="ltr" className="w-full">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.slug} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend formatter={(value) => <span className="ps-2 text-sm">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
