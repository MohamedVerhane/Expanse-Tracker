"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { resendVerificationAction, type ResendState } from "@/app/actions/auth";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
      {pending ? "Resending..." : "Resend email"}
    </Button>
  );
}

export function ResendVerificationForm({ initialEmail }: { initialEmail?: string }) {
  const [state, formAction, isPending] = useActionState<ResendState, FormData>(resendVerificationAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.cooldownMs && state.cooldownMs > 0 && (
        <p className="text-xs text-muted" role="status">
          Retry in {Math.ceil(state.cooldownMs / 1000)}s
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400" role="status">
          Verification email sent. Check your inbox.
        </p>
      )}
      <div>
        <Label htmlFor="resend-email">Email</Label>
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
      <SubmitButton pending={isPending} />
    </form>
  );
}
