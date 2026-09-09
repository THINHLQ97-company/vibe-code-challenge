import bcrypt from "bcryptjs";

// Node-only (bcryptjs) — KHÔNG import file này từ middleware.ts (Edge runtime).
// Dùng lib/auth/session.ts cho phần chạy được cả Edge lẫn Node.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
