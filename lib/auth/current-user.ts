import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { getSession } from "./session";

/**
 * Người đang đăng nhập, VAI TRÒ ĐỌC TỪ DATABASE.
 *
 * Cookie phiên có mang sẵn `role`, nhưng nó được ký lúc đăng nhập và sống 7 ngày — tức là một bản
 * chụp cũ. Hệ quả đã gặp thật (15/09/2026): nâng một tài khoản từ thí sinh lên giám khảo mà người
 * đó vẫn vào với quyền thí sinh, vì mọi chỗ kiểm quyền đều đọc `session.role`.
 *
 * Chiều ngược lại nguy hiểm hơn nhiều: HẠ quyền một người không thu hồi được quyền của họ cho tới
 * khi cookie hết hạn. Một người bị gỡ khỏi ban giám khảo vẫn chấm bài được suốt bảy ngày.
 *
 * Nên `userId` trong cookie là thứ duy nhất còn tin được — đó là danh tính, không đổi. Vai trò
 * phải hỏi lại database ở mỗi lần kiểm.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  return user ?? null;
}

/** Vai trò hiện tại, đã đối chiếu database. `null` khi chưa đăng nhập hoặc tài khoản đã bị xoá. */
export async function getCurrentRole(): Promise<"candidate" | "judge" | "admin" | null> {
  return (await getCurrentUser())?.role ?? null;
}
