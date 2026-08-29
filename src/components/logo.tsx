import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white",
        className,
      )}
      aria-hidden="true"
    >
      ET
    </span>
  );
}

export function Brand() {
  return (
    <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
      <Logo />
      <span>
        Expense<span className="text-emerald-600">Tracker</span>
      </span>
    </span>
  );
}
