export const DEFAULT_CATEGORIES = [
  { name: "Food", slug: "food", color: "#ef4444" },
  { name: "Transport", slug: "transport", color: "#f97316" },
  { name: "Education", slug: "education", color: "#3b82f6" },
  { name: "Entertainment", slug: "entertainment", color: "#8b5cf6" },
  { name: "Shopping", slug: "shopping", color: "#ec4899" },
  { name: "Bills", slug: "bills", color: "#eab308" },
  { name: "Health", slug: "health", color: "#10b981" },
  { name: "Other", slug: "other", color: "#6b7280" },
] as const;

export type CategorySeed = (typeof DEFAULT_CATEGORIES)[number];
