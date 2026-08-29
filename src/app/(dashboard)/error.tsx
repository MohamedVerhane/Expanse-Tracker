"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/components/locale-provider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10 text-center">
      <h2 className="text-lg font-semibold">{t("error.title")}</h2>
      <p className="mt-2 text-sm text-muted">{t("error.description")}</p>
      <Button className="mt-6" onClick={reset}>
        {t("error.retry")}
      </Button>
    </div>
  );
}
