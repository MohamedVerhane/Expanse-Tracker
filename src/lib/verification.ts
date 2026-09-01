import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createVerificationToken(userId: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  const hash = hashToken(raw);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { userId } }),
    prisma.verificationToken.create({
      data: {
        token: hash,
        userId,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  return raw;
}

export type VerifyResult =
  | { status: "ok"; user: { id: string; email: string } }
  | { status: "invalid" }
  | { status: "expired" };

export async function verifyEmailToken(raw: string): Promise<VerifyResult> {
  const hash = hashToken(raw);
  const record = await prisma.verificationToken.findUnique({ where: { token: hash } });
  if (!record) return { status: "invalid" };

  const expired = record.expiresAt < new Date();

  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: { id: true, email: true },
  });

  if (expired || !user) {
    await prisma.verificationToken.deleteMany({ where: { token: hash } });
    return expired ? { status: "expired" } : { status: "invalid" };
  }

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { token: hash } }),
    prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } }),
  ]);

  return { status: "ok", user };
}