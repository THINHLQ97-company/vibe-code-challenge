import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { setUserRole, countAdmins } from "@/lib/db/queries/users";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const schema = z.object({ role: z.enum(["candidate", "judge", "admin"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Mã tài khoản không hợp lệ" }, { status: 400 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vai trò không hợp lệ" }, { status: 400 });

  const target = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!target) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });

  /**
   * Không cho hạ quyền người quản trị CUỐI CÙNG.
   *
   * Không có chốt này thì một cú bấm nhầm là hệ thống không còn ai vào được trang quản trị, và
   * cách duy nhất để cứu là sửa thẳng database — thứ không ai muốn làm giữa mùa thi.
   */
  if (target.role === "admin" && parsed.data.role !== "admin" && (await countAdmins()) <= 1) {
    return NextResponse.json(
      { error: "Đây là tài khoản quản trị duy nhất — chỉ định người khác làm quản trị trước" },
      { status: 409 }
    );
  }

  return NextResponse.json({ user: await setUserRole(id, parsed.data.role) });
}
