import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById, rejectFacebookPost } from "@/lib/db/queries/submissions";

export const dynamic = "force-dynamic";

const schema = z.object({
  note: z.string().min(10, "Phải nêu rõ vì sao từ chối — thí sinh mất toàn bộ điểm lan tỏa"),
});

/**
 * BTC từ chối bài đăng trên nhóm cộng đồng.
 *
 * Bắt buộc kèm lý do, và câu đó hiện thẳng cho thí sinh: đây là quyết định lấy mất 20 điểm của
 * họ mà không cho làm lại, nên tối thiểu phải nói được vì sao.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const s = await getSubmissionById(id);
  if (!s) return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });
  if (!s.facebookPostUrl) {
    return NextResponse.json({ error: "Thí sinh chưa dán link bài đăng" }, { status: 409 });
  }
  if (s.facebookApprovedAt) {
    return NextResponse.json(
      { error: "Bài đăng đã được duyệt — không từ chối ngược lại được" },
      { status: 409 }
    );
  }

  const row = await rejectFacebookPost(id, parsed.data.note);
  return NextResponse.json({ ok: true, postRejectedAt: row.postRejectedAt });
}
