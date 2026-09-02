import "server-only";
import { prisma } from "@/lib/prisma";
import type { TokenStore } from "@/lib/verification";

export const prismaTokenStore: TokenStore = {
  async create(input) {
    return prisma.verificationToken.create({ data: input });
  },
  async findLatestByUserId(token) {
    const record = await prisma.verificationToken.findFirst({
      where: { token },
      orderBy: { createdAt: "desc" },
    });
    if (!record) return null;
    return {
      id: record.id,
      token: record.token,
      userId: record.userId,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    };
  },
  async deleteById(id) {
    await prisma.verificationToken.delete({ where: { id } });
  },
  async deleteExpired() {
    await prisma.verificationToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
} satisfies TokenStore;
