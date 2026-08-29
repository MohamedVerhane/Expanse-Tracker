import { LoginForm } from "@/components/auth/LoginForm";
import { getLocale } from "@/lib/locale";
import { translate } from "@/lib/i18n";

export default async function LoginPage() {
  const locale = await getLocale();
  const t = (key: string) => translate(locale, key);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">{t("auth.welcome")}</h1>
      <p className="mb-6 text-sm text-muted">{t("auth.signInSubtitle")}</p>
      <LoginForm />
    </div>
  );
}
