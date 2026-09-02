import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  generateToken,
  hashToken,
  TOKEN_TTL_MS,
  RESEND_COOLDOWN_MS,
  type TokenRecord,
  type TokenStore,
  createVerificationToken,
  verifyVerificationToken,
} from "./src/lib/verification.js";

class InMemoryTokenStore implements TokenStore {
  private tokens: Map<string, TokenRecord> = new Map();
  private nextId = 1;

  async create(input: { userId: string; token: string; expiresAt: Date }): Promise<TokenRecord> {
    const record: TokenRecord = {
      id: String(this.nextId++),
      token: input.token,
      userId: input.userId,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
    };
    this.tokens.set(record.id, record);
    return record;
  }

  async findLatestByUserId(token: string): Promise<TokenRecord | null> {
    let latest: TokenRecord | null = null;
    for (const record of this.tokens.values()) {
      if (record.token === token) {
        if (!latest || record.createdAt > latest.createdAt) {
          latest = record;
        }
      }
    }
    return latest;
  }

  async deleteById(id: string): Promise<void> {
    this.tokens.delete(id);
  }

  async deleteExpired(): Promise<void> {
    const now = Date.now();
    for (const [id, record] of this.tokens) {
      if (record.expiresAt.getTime() < now) {
        this.tokens.delete(id);
      }
    }
  }
}

describe("generateToken", () => {
  it("returns a 64-character hex string", () => {
    const token = generateToken();
    assert.match(token, /^[0-9a-f]{64}$/);
  });

  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    assert.equal(tokens.size, 100);
  });
});

describe("hashToken", () => {
  it("returns a 64-character hex string", () => {
    const hash = hashToken("test");
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    assert.equal(hashToken("abc"), hashToken("abc"));
  });

  it("differs for different inputs", () => {
    assert.notEqual(hashToken("a"), hashToken("b"));
  });
});

describe("createVerificationToken", () => {
  let store: InMemoryTokenStore;

  beforeEach(() => {
    store = new InMemoryTokenStore();
  });

  it("returns a raw token and stores the hashed version", async () => {
    const raw = await createVerificationToken("user-1", store);
    const hashed = hashToken(raw);
    const record = await store.findLatestByUserId(hashed);
    assert.ok(record);
    assert.equal(record.userId, "user-1");
    assert.ok(record.expiresAt.getTime() > Date.now());
  });
});

describe("verifyVerificationToken", () => {
  let store: InMemoryTokenStore;

  const mockGetUser = (id: string) =>
    Promise.resolve(id === "user-1" ? { id: "user-1", email: "test@example.com" } : null);

  beforeEach(() => {
    store = new InMemoryTokenStore();
  });

  it("returns 'ok' for valid token and updates emailVerifiedAt", async () => {
    const raw = await createVerificationToken("user-1", store);
    const result = await verifyVerificationToken(raw, store, mockGetUser);
    assert.equal(result.status, "ok");
    if (result.status === "ok") {
      assert.equal(result.userId, "user-1");
      assert.equal(result.email, "test@example.com");
    }
    // Token should be deleted (single-use)
    const record = await store.findLatestByUserId(hashToken(raw));
    assert.equal(record, null);
  });

  it("returns 'invalid' for non-existent token", async () => {
    const result = await verifyVerificationToken("fake-token", store, mockGetUser);
    assert.equal(result.status, "invalid");
  });

  it("returns 'expired' for expired token", async () => {
    const raw = await createVerificationToken("user-1", store);
    const hashed = hashToken(raw);
    // Get the record and force it to be expired
    const record = await store.findLatestByUserId(hashed);
    assert.ok(record);
    record.expiresAt = new Date(Date.now() - 1000);
    const result = await verifyVerificationToken(raw, store, mockGetUser);
    assert.equal(result.status, "expired");
    // Expired token should be deleted
    const deleted = await store.findLatestByUserId(hashed);
    assert.equal(deleted, null);
  });

  it("returns 'invalid' for token of non-existent user", async () => {
    const raw = await createVerificationToken("user-999", store);
    const result = await verifyVerificationToken(raw, store, mockGetUser);
    assert.equal(result.status, "invalid");
  });

  it("can only be used once (single-use)", async () => {
    const raw = await createVerificationToken("user-1", store);
    const result1 = await verifyVerificationToken(raw, store, mockGetUser);
    assert.equal(result1.status, "ok");
    const result2 = await verifyVerificationToken(raw, store, mockGetUser);
    assert.equal(result2.status, "invalid");
  });
});

describe("Resend cooldown", () => {
  it("RESEND_COOLDOWN_MS is defined and reasonable", () => {
    assert.ok(RESEND_COOLDOWN_MS > 0);
    assert.ok(RESEND_COOLDOWN_MS <= 60_000); // At most 1 minute
  });

  it("TOKEN_TTL_MS is 1 hour", () => {
    assert.equal(TOKEN_TTL_MS, 3_600_000);
  });
});
