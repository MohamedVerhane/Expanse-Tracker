"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { resendVerificationAction, type ResendState } from "@/app/actions/auth";
import { useTranslations } from "@/components/locale-provider";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslations();
  return (
    <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
      {pending ? t("verify.resending") : t("verify.resend")}
    </Button>
  );
}

export function ResendVerificationForm({ initialEmail }: { initialEmail?: string }) {
  const [state, formAction] = useActionState<ResendState, FormData>(resendVerificationAction, {});
  const { t } = useTranslations();

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {t("verify.sent")}
        </p>
      )}
      <div>
        <Label htmlFor="resend-email">{t("form.email")}</Label>
        <Input
          id="resend-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          defaultValue={initialEmail ?? ""}
        />
      </div>
      <SubmitButton />
    </form>
  );
}