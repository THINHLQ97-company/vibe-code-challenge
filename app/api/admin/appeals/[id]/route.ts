import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { resolveAppeal } from "@/lib/db/queries/appeals";
import { reopenForRescore } from "@/lib/db/queries/submissions";

const schema = z.object({ status: z.enum(["accepted", "rejected"]), note: z.string().min(1) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { id } = await params;
  const row = await resolveAppeal(Number(id), parsed.data.status, parsed.data.note, auth.session.userId);
  if (!row) {
    return NextResponse.json({ error: "Không tìm thấy phản biện" }, { status: 404 });
  }

  // CHẤP NHẬN phản biện = điểm cũ bị bác, nên phải mở lại bài cho hội đồng chấm lại. Trước đây
  // route này chỉ ghi kết luận rồi thôi: điểm cũ vẫn treo trên bảng xếp hạng, mà cổng chặn công bố
  // lại thì khoá luôn đường sửa — nút "Chấp nhận & chấm lại" hứa một việc mà hệ thống không làm.
  if (parsed.data.status === "accepted") {
    await reopenForRescore(row.submissionId);
  }

  return NextResponse.json({ appeal: row, reopened: parsed.data.status === "accepted" });
}
