import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            trend === "up" && "text-red-500",
            trend === "down" && "text-emerald-500",
            trend === "neutral" && "text-muted",
          )}
        >
          {hint}
        </p>
      )}
    </Card>
  );
}
