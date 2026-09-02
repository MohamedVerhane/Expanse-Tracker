"use server";

import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword, hashPassword } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validation";
import { createVerificationToken, RESEND_COOLDOWN_MS } from "@/lib/verification";
import { prismaTokenStore } from "@/lib/verify-store";
import { sendVerificationEmail } from "@/lib/mail";
import { getLocale } from "@/lib/locale";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error) };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, password: hashed } });

  try {
    const rawToken = await createVerificationToken(user.id, prismaTokenStore);
    await sendVerificationEmail({ to: email, token: rawToken, locale: await getLocale() });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    return {
      error: "We couldn't send the verification email. Make sure the email service is configured correctly, then try again.",
    };
  }

  await createSession({ userId: user.id, email: user.email });
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error) };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession({ userId: user.id, email: user.email });
  if (!user.emailVerifiedAt) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);
  }
  redirect("/dashboard");
}

export type ResendState = {
  ok?: boolean;
  error?: string;
  cooldownMs?: number;
};

export async function resendVerificationAction(
  _prev: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const parsed = loginSchema.shape.email.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  if (!user) {
    return { ok: false, error: "No account found with this email address." };
  }
  if (user.emailVerifiedAt) {
    return { ok: false, error: "This email address is already verified." };
  }

  const last = await prismaTokenStore.findLatestByUserId(user.id);
  if (last) {
    const remaining = last.createdAt.getTime() + RESEND_COOLDOWN_MS - Date.now();
    if (remaining > 0) {
      return { ok: false, error: "Please wait before requesting another email.", cooldownMs: remaining };
    }
  }

  try {
    const rawToken = await createVerificationToken(user.id, prismaTokenStore);
    await sendVerificationEmail({ to: user.email, token: rawToken, locale: await getLocale() });
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    return { ok: false, error: "We couldn't send the email. Please try again later." };
  }

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

function flatten(error: import("zod").ZodError): Record<string, string> {
  const flat = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const result: Record<string, string> = {};
  for (const key of Object.keys(flat)) {
    const value = flat[key];
    if (value && value.length > 0) result[key] = value[0];
  }
  return result;
}