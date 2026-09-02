import "server-only";
import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/site";
import { translate, type Locale } from "@/lib/i18n";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured: set SMTP_HOST, SMTP_USER, and SMTP_PASS (see .env.example).",
    );
  }
  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    user,
    pass,
    secure: process.env.SMTP_SECURE === "true",
    fromName: process.env.MAIL_FROM_NAME ?? "Expense Tracker",
    fromEmail: process.env.MAIL_FROM_EMAIL ?? "no-reply@expense-tracker.local",
  };
}

export type SendVerificationEmailInput = {
  to: string;
  token: string;
  locale: Locale;
};

export async function sendVerificationEmail({ to, token, locale }: SendVerificationEmailInput): Promise<void> {
  const cfg = getSmtpConfig();
  const url = `${getSiteUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const t = (key: string) => translate(locale, key);

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  await transporter.sendMail({
    from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
    to,
    subject: t("mail.verifySubject"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#111827;margin:0 0 12px;">${t("mail.verifyTitle")}</h2>
        <p style="color:#4b5563;line-height:1.6;">${t("mail.verifyIntro")}</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${url}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">${t("mail.verifyButton")}</a>
        </p>
        <p style="color:#9ca3af;font-size:13px;line-height:1.5;">${t("mail.verifyIgnore")}</p>
      </div>
    `,
  });
}
