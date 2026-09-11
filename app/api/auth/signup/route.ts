import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, departmentToBoard } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { signSession, toSessionPayload, AUTH_COOKIE } from "@/lib/auth/session";
import { isPasswordLoginEnabled } from "@/lib/settings";

const DEPARTMENTS = Object.keys(departmentToBoard) as [string, ...string[]];

const signupSchema = z.object({
  name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .refine((e) => e.toLowerCase().endsWith("@matbao.com"), {
      message: "Chỉ chấp nhận email @matbao.com",
    }),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  department: z.enum(DEPARTMENTS, { message: "Chọn phòng ban hợp lệ" }),
  employeeCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  /**
   * Tắt đăng nhập mật khẩu thì phải tắt luôn đường TẠO tài khoản mật khẩu — để hở chỗ này thì
   * người ta vẫn tự mở được một tài khoản có mật khẩu, chỉ là không đăng nhập được ngay, và khi
   * BTC bật lại đường mật khẩu vì lý do gì đó thì cả đám tài khoản tự tạo đó sống dậy.
   */
  if (!(await isPasswordLoginEnabled())) {
    return NextResponse.json(
      { error: "Kỳ thi chỉ nhận đăng nhập bằng tài khoản Microsoft của công ty" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }
  const { name, email, password, department, employeeCode } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
  if (existing) {
    return NextResponse.json({ error: "Email đã được đăng ký" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      department,
      board: departmentToBoard[department],
      employeeCode,
      role: "candidate",
    })
    .returning();

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
