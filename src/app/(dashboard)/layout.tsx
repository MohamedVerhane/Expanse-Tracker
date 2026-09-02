import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerifiedAt) redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
