import "server-only";
import nodemailer from "nodemailer";
import { getSiteUrl } from "./site";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
};

function getSmtpConfig(): SmtpConfig {
  return {
    host: process.env.MAILTRAP_HOST ?? "sandbox.smtp.mailtrap.io",
    port: Number(process.env.MAILTRAP_PORT ?? 2525),
    user: process.env.MAILTRAP_USER ?? "",
    pass: process.env.MAILTRAP_PASS ?? "",
    fromName: process.env.MAIL_FROM_NAME ?? "Expense Tracker",
    fromEmail: process.env.MAIL_FROM_EMAIL ?? "no-reply@expense-tracker.local",
  };
}

let transporterCache: ReturnType<typeof createTransporter> | null = null;

function createTransporter() {
  const { host, port, user, pass } = getSmtpConfig();
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });
}

function getTransporter() {
  if (!transporterCache) transporterCache = createTransporter();
  return transporterCache;
}

async function sendMail(to: string, subject: string, text: string, html: string) {
  const { fromName, fromEmail } = getSmtpConfig();
  const info = await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
  if (process.env.NODE_ENV !== "production") {
    console.log(`[mail] sent id=${info.messageId} to=${to}`);
  }
}

export async function sendVerificationEmail(to: string, token: string, locale: string) {
  const url = `${getSiteUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const isArabic = locale === "ar";

  const subject = isArabic ? "تأكيد بريدك الإلكتروني — متتبع المصاريف" : "Verify your email — Expense Tracker";
  const heading = isArabic ? "تأكيد بريدك الإلكتروني" : "Verify your email";
  const body = isArabic
    ? "مرحبًا، شكرًا لإنشائك حسابًا في متتبع المصاريف. اضغط على الزر أدناه لتأكيد بريدك الإلكتروني."
    : "Hi, thanks for creating your Expense Tracker account. Click the button below to confirm your email address.";
  const cta = isArabic ? "تأكيد البريد الإلكتروني" : "Confirm email address";
  const alt = isArabic
    ? "إذا لم يعمل الزر، انسخ الرابط والصقه في متصفحك:"
    : "If the button doesn't work, copy and paste this link into your browser:";
  const expires = isArabic ? "هذا الرابط صالح لمدة ساعة." : "This link expires in 1 hour.";

  const html = `
  <div style="background:#f9fafb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;direction:${isArabic ? "rtl" : "ltr"};text-align:${isArabic ? "right" : "left"}">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">${heading}</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">${body}</p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${url}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:10px;">${cta}</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">${alt}</p>
      <p style="margin:0 0 16px;font-size:13px;word-break:break-all;color:#374151;direction:ltr;text-align:left;"><a href="${url}">${url}</a></p>
      <p style="margin:0;font-size:13px;color:#6b7280;">${expires}</p>
    </div>
  </div>`;

  await sendMail(to, subject, `${body}\n\n${url}\n\n${expires}`, html);
}