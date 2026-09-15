import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./auth/session";
import { getCurrentUser } from "./auth/current-user";

/**
 * Cổng kiểm quyền cho các route.
 *
 * Vai trò LUÔN đọc từ database, không lấy từ cookie — xem `lib/auth/current-user.ts` để biết vì
 * sao. `session.role` trả về ở đây cũng đã được thay bằng vai trò thật, để nơi gọi không vô tình
 * dùng lại con số cũ trong cookie.
 */
export async function requireSession(
  roles?: SessionPayload["role"][]
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  }

  const user = await getCurrentUser();
  // Tài khoản bị xoá nhưng cookie còn sống — coi như chưa đăng nhập.
  if (!user) {
    return { error: NextResponse.json({ error: "Tài khoản không còn tồn tại" }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { error: NextResponse.json({ error: "Không đủ quyền" }, { status: 403 }) };
  }
  return { session: { ...session, role: user.role } };
}
