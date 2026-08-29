import "server-only";
import { cookies } from "next/headers";
import { locales, defaultLocale, type Locale } from "./i18n";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return (locales as readonly string[]).includes(value ?? "") ? (value as Locale) : defaultLocale;
}
