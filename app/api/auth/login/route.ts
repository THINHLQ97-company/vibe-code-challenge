import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { signSession, toSessionPayload, AUTH_COOKIE } from "@/lib/auth/session";
import { isPasswordLoginEnabled } from "@/lib/settings";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  /**
   * Chốt chặn nằm Ở ĐÂY, không phải ở giao diện. Trang đăng nhập có ẩn ô mật khẩu đi thì cũng chỉ
   * là ẩn — ai gọi thẳng vào route này vẫn đăng nhập được như thường. Khi BTC tắt đường mật khẩu
   * để vào thi thật, nó phải thật sự đóng.
   */
  if (!(await isPasswordLoginEnabled())) {
    return NextResponse.json(
      { error: "Đăng nhập bằng mật khẩu đang tắt — dùng tài khoản Microsoft của công ty" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email/mật khẩu không hợp lệ" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
  /**
   * `passwordHash` rỗng = tài khoản tạo từ Microsoft, chưa từng đặt mật khẩu. Trả về đúng câu báo
   * lỗi như khi sai mật khẩu, KHÔNG nói "tài khoản này dùng Microsoft": phân biệt hai câu trả lời
   * là biến ô đăng nhập thành công cụ dò xem email nào có thật trong công ty.
   */
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });
  }

  // Ghi mốc đăng nhập để trang quản lý người dùng biết ai đã thật sự vào hệ thống. Không chặn
  // luồng nếu ghi hỏng — đăng nhập được hay không quan trọng hơn một cột thống kê.
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id))
    .catch(() => undefined);

  const token = await signSession(toSessionPayload(user));
  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, board: user.board },
  });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
