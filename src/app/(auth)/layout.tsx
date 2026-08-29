import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Brand } from "@/components/logo";
import { getLocale } from "@/lib/locale";
import { translate } from "@/lib/i18n";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = (key: string) => translate(locale, key);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight">
            <Brand />
          </Link>
          <p className="mt-2 text-sm text-muted">{t("auth.manage")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </div>
  );
}
