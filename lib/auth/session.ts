import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { departmentToBoard, type User } from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET chưa được cấu hình trong env");
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

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
    .sign(secretKey);
}

// jose chạy được cả Edge runtime (middleware.ts) lẫn Node (route handlers) —
// file này KHÔNG được import bcryptjs/lib Node-only nào, để middleware bundle gọn.
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
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
