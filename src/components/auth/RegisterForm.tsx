"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { registerAction, type AuthState } from "@/app/actions/auth";
import { useTranslations } from "@/components/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslations();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? t("form.creating") : t("action.createAccount")}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(registerAction, {});
  const { t } = useTranslations();

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <Label htmlFor="name">{t("form.name")}</Label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faUser}
            className="pointer-events-none absolute inset-y-0 start-3 my-auto text-slate-400"
          />
          <Input id="name" name="name" type="text" autoComplete="name" required placeholder="Jane Doe" className="ps-9" />
        </div>
        {state.fieldErrors?.name && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>}
      </div>
      <div>
        <Label htmlFor="email">{t("form.email")}</Label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="pointer-events-none absolute inset-y-0 start-3 my-auto text-slate-400"
          />
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="ps-9" />
        </div>
        {state.fieldErrors?.email && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email}</p>}
      </div>
      <div>
        <Label htmlFor="password">{t("form.password")}</Label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faLock}
            className="pointer-events-none absolute inset-y-0 start-3 my-auto text-slate-400"
          />
          <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="At least 8 characters" className="ps-9" />
        </div>
        {state.fieldErrors?.password && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.password}</p>}
      </div>
      <SubmitButton />
      <p className="text-center text-sm text-muted">
        {t("auth.hasAccount")}{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          {t("action.signIn")}
        </Link>
      </p>
    </form>
  );
}
