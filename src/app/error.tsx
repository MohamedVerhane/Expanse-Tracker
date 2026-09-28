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
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-border bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">{t("error.title")}</h2>
        <p className="mt-2 text-sm text-muted">{t("error.description")}</p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-muted">
            Reference: {error.digest}
          </p>
        ) : null}
        <Button className="mt-6" onClick={reset}>
          {t("error.retry")}
        </Button>
      </div>
    </div>
  );
}
