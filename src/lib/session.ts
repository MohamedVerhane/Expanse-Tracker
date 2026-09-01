import "server-only";
import { getSession } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
