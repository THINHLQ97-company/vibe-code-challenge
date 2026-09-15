import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { listManagedUsers, findUserByEmail, inviteUser } from "@/lib/db/queries/users";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .refine((e) => e.toLowerCase().endsWith("@matbao.com"), "Chỉ nhận email @matbao.com"),
  name: z.string().max(120).optional(),
  role: z.enum(["judge", "admin"], { message: "Vai trò mời phải là giám khảo hoặc quản trị" }),
});

export async function GET() {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;
  return NextResponse.json({ users: await listManagedUsers() });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = inviteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }
  const { email, name, role } = parsed.data;

  // Đã có tài khoản thì KHÔNG tạo trùng — nói rõ để admin biết dùng nút đổi vai trò thay vì mời lại.
  if (await findUserByEmail(email)) {
    return NextResponse.json(
      { error: "Email này đã có tài khoản — đổi vai trò trong danh sách bên dưới" },
      { status: 409 }
    );
  }

  return NextResponse.json({ user: await inviteUser(email, role, name) });
}
