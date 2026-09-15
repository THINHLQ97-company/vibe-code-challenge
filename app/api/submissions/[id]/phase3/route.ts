import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById, submitFacebookPost } from "@/lib/db/queries/submissions";

const schema = z.object({ facebookPostUrl: z.string().url("Link bài đăng không hợp lệ") });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["candidate"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const submission = await getSubmissionById(Number(id));
  if (!submission || submission.userId !== auth.session.userId) {
    return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Không chặn cứng giữa các phase (BTC đã chốt), nhưng phải có sản phẩm rồi mới lan tỏa được:
  // nộp link bài đăng khi chưa nộp Vibe Host là quảng bá một thứ chưa tồn tại, và BTC không có
  // gì để đối chiếu khi duyệt bài (CP5).
  if (!submission.vibehostUrl) {
    return NextResponse.json(
      { error: "Cần nộp sản phẩm Phase 2 (link Vibe Host + mã nguồn) trước khi nộp bài lan tỏa" },
      { status: 409 }
    );
  }
  /**
   * Chưa xác nhận checklist thì chưa nhận link.
   *
   * Checklist là căn cứ để ban tổ chức loại một bài đăng không đạt mà không phải tranh cãi. Nhận
   * link trước rồi hỏi sau thì căn cứ đó ra đời sau hành vi nó định ràng buộc — tức không ràng
   * buộc được gì.
   */
  if (!submission.phase3ChecklistAckedAt) {
    return NextResponse.json(
      { error: "Cần đọc và tick đủ checklist trước khi gửi link bài đăng" },
      { status: 409 }
    );
  }
  if (submission.facebookApprovedAt) {
    return NextResponse.json(
      { error: "Bài đăng đã được BTC duyệt, không đổi link được nữa" },
      { status: 409 }
    );
  }

  const row = await submitFacebookPost(submission.id, parsed.data.facebookPostUrl);
  return NextResponse.json({ submission: row });
}
