import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";
import { verifyEmailToken } from "@/lib/verification";
import { createSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { translate } from "@/lib/i18n";

type SearchParams = Record<string, string | string[] | undefined>;

function str(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: translate(locale, "app.title"),
  };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = (key: string, p?: Record<string, string>) => translate(locale, key, p);

  const token = str(params.token);
  const email = str(params.email);

  if (token) {
    const result = await verifyEmailToken(token);
    if (result.status === "ok") {
      await createSession({ userId: result.user.id, email: result.user.email });
      redirect("/dashboard");
    }
    const messageKey = result.status === "expired" ? "verify.expired" : "verify.invalid";
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">{t("verify.title")}</h1>
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{t(messageKey)}</p>
        <p className="text-sm text-muted">{t("verify.enterEmail")}</p>
        <ResendVerificationForm initialEmail={email} />
        <p className="text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            {t("verify.backToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t("verify.title")}</h1>
      <p className="text-sm text-muted">{t("verify.subtitle", { email: email ?? "" })}</p>
      <p className="text-sm text-muted">{t("verify.hint")}</p>
      {email ? (
        <ResendVerificationForm initialEmail={email} />
      ) : (
        <>
          <p className="text-sm text-muted">{t("verify.enterEmail")}</p>
          <ResendVerificationForm />
        </>
      )}
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          {t("verify.backToLogin")}
        </Link>
      </p>
    </div>
  );
}