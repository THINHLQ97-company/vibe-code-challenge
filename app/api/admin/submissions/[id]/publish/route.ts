import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { publish } from "@/lib/publish-one";

export const dynamic = "force-dynamic";

/**
 * Công bố KẾT QUẢ CUỐI cho một bài. Điều kiện nằm ở `publish(..., "final")`, dùng chung với đường
 * công bố hàng loạt — hai đường không được phép áp hai bộ luật khác nhau.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Mã bài dự thi không hợp lệ" }, { status: 400 });
  }

  const result = await publish(id, "final");
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true, finalScore: result.finalScore });
}
