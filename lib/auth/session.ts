import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { departmentToBoard, type User } from "../db/schema";

/**
 * Đọc khoá TRỄ, không đọc lúc nạp module.
 *
 * `next build` có bước thu thập dữ liệu trang, bước đó nạp mọi route — kể cả route đăng xuất
 * vốn import file này. Ném lỗi ngay lúc nạp module tức là BẮT BUỘC phải có khoá thật mới build
 * nổi, mà khoá thật không nên nằm trong môi trường build. Máy dev không lộ ra vì `docker build`
 * chép luôn file `.env` không được commit vào ảnh; build từ bản sao sạch của repo thì gãy.
 *
 * Đọc trễ thì lúc build không ai gọi tới, còn lúc chạy thật thiếu khoá vẫn báo lỗi rõ ràng.
 */
let cachedKey: Uint8Array | null = null;
function getSecretKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET chưa được cấu hình trong env");
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

export const AUTH_COOKIE = "vcc_token";
const TOKEN_TTL = "7d";

export type SessionPayload = {
  userId: number;
  email: string;
  role: "candidate" | "judge" | "admin";
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey());
}

// jose chạy được cả Edge runtime (middleware.ts) lẫn Node (route handlers) —
// file này KHÔNG được import bcryptjs/lib Node-only nào, để middleware bundle gọn.
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function boardForDepartment(department: string) {
  return departmentToBoard[department] ?? null;
}

export function toSessionPayload(user: User): SessionPayload {
  return { userId: user.id, email: user.email, role: user.role };
}
