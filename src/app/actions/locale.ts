"use server";

import { cookies } from "next/headers";
import { locales, defaultLocale, type Locale } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/locale";

export async function setLocaleAction(locale: Locale): Promise<void> {
  const next = (locales as readonly string[]).includes(locale) ? locale : defaultLocale;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
