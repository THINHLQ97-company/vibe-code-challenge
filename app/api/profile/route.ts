import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

/**
 * Trần dữ liệu ảnh nhận từ trình duyệt: 1 MB như yêu cầu.
 *
 * Trình duyệt đã resize về ≤512px + nén JPEG trước khi gửi nên thực tế chỉ vài chục KB; trần này
 * là để chặn người gọi thẳng API mà bỏ qua bước resize, không phải để dùng tới. base64 phình ~4/3
 * so với nhị phân nên quy đổi ngược ra đúng 1 MB dữ liệu ảnh.
 */
const AVATAR_MAX_BYTES = 1024 * 1024;
const AVATAR_MAX_CHARS = Math.ceil((AVATAR_MAX_BYTES * 4) / 3) + 64;

const avatarSchema = z
  .string()
  .max(AVATAR_MAX_CHARS, "Ảnh vượt quá 1 MB")
  .refine((v) => /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v), {
    message: "Ảnh không hợp lệ — chỉ nhận JPEG, PNG hoặc WebP",
  });

const schema = z.union([
  z.object({
    action: z.literal("avatar"),
    // `null` = gỡ ảnh, quay về chữ cái đầu của tên.
    avatar: avatarSchema.nullable(),
  }),
  z.object({
    action: z.literal("password"),
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự"),
  }),
]);

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  if (parsed.data.action === "avatar") {
    const [row] = await db
      .update(users)
      .set({ avatarUrl: parsed.data.avatar })
      .where(eq(users.id, auth.session.userId))
      .returning();
    return NextResponse.json({ avatarUrl: row.avatarUrl });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, auth.session.userId) });
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
  }
  // Bắt buộc xác nhận mật khẩu hiện tại: cookie phiên có thể bị mượn trên máy để quên đăng xuất,
  // và đổi mật khẩu là thao tác chiếm luôn tài khoản.
  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 401 });
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json({ error: "Mật khẩu mới phải khác mật khẩu cũ" }, { status: 400 });
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword) })
    .where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
