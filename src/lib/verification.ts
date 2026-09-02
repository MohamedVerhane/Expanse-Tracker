import { randomBytes, createHash } from "crypto";

export const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour
export const RESEND_COOLDOWN_MS = 1000 * 60; // 1 minute between resends

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export type TokenRecord = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
};

export type TokenStore = {
  create(input: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<TokenRecord>;
  findLatestByUserId(userId: string): Promise<TokenRecord | null>;
  deleteById(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
};

export type VerifyResult =
  | { status: "ok"; userId: string; email: string }
  | { status: "invalid" }
  | { status: "expired" };

export async function createVerificationToken(userId: string, store: TokenStore): Promise<string> {
  const raw = generateToken();
  await store.create({
    userId,
    token: hashToken(raw),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });
  return raw;
}

export async function verifyVerificationToken(
  rawToken: string,
  store: TokenStore,
  getUser: (userId: string) => Promise<{ id: string; email: string } | null>,
): Promise<VerifyResult> {
  const record = await store.findLatestByUserId(hashToken(rawToken));
  if (!record) return { status: "invalid" };

  if (record.expiresAt.getTime() < Date.now()) {
    await store.deleteById(record.id);
    return { status: "expired" };
  }

  const user = await getUser(record.userId);
  if (!user) return { status: "invalid" };

  await store.deleteById(record.id);
  return { status: "ok", userId: user.id, email: user.email };
}
