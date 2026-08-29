"use server";

import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword, hashPassword } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validation";
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

  await createSession({ userId: user.id, email: user.email });
  redirect("/dashboard");
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
  redirect("/dashboard");
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
