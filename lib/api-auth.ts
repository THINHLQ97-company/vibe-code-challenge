import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./auth/session";

export async function requireSession(
  roles?: SessionPayload["role"][]
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  }
  if (roles && !roles.includes(session.role)) {
    return { error: NextResponse.json({ error: "Không đủ quyền" }, { status: 403 }) };
  }
  return { session };
}
