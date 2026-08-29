"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { translate, getDir, type Locale } from "@/lib/i18n";
import { setLocaleAction } from "@/app/actions/locale";

type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const dir = getDir(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.documentElement.lang = next;
      document.documentElement.dir = getDir(next);
      void setLocaleAction(next).then(() => router.refresh());
    },
    [router],
  );

  const t = useCallback(
    (key: string, params?: Record<string, string>) => translate(locale, key, params),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, dir, t, setLocale }}>{children}</LocaleContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useTranslations must be used within a LocaleProvider");
  return ctx;
}

export function useLocale() {
  return useTranslations().locale;
}
