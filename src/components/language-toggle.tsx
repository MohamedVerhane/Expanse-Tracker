"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "./locale-provider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslations();
  const next = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "English" : "العربية";

  return (
    <button
      onClick={() => setLocale(next)}
      dir="ltr"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={t("language.toggle")}
      title={t("language.toggle")}
    >
      <FontAwesomeIcon
        icon={faGlobe}
        className={locale === "ar" ? "order-2" : "order-2"}
        aria-hidden="true"
      />
      <span className={locale === "ar" ? "order-2" : "order-1"}>{label}</span>
    </button>
  );
}
