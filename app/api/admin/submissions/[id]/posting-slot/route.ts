import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById } from "@/lib/db/queries/submissions";
import { moveSubmissionToSlot } from "@/lib/db/queries/posting-slots";

export const dynamic = "force-dynamic";

/** `null` = gỡ bài khỏi khung, trả nó về hàng chờ xếp. */
const schema = z.object({ slotId: z.number().int().positive().nullable() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const submission = await getSubmissionById(Number((await params).id));
  if (!submission) return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Khung giờ không hợp lệ" }, { status: 400 });
  }

  /**
   * Bài đã được ban tổ chức duyệt cho lên nhóm thì KHÔNG đổi khung nữa.
   *
   * Khung giờ tồn tại để quyết định lúc nào bài lên nhóm. Bài đã lên rồi thì đổi khung không dời
   * được gì cả — nó chỉ làm lịch ghi một đằng, thực tế một nẻo, và cửa sổ đếm bảy ngày tương tác
   * thì tính từ lúc duyệt chứ không tính từ khung.
   */
  if (submission.facebookApprovedAt) {
    return NextResponse.json(
      { error: "Bài đã được duyệt cho lên nhóm — đổi khung giờ lúc này không còn tác dụng" },
      { status: 409 }
    );
  }

  const row = await moveSubmissionToSlot(submission.id, parsed.data.slotId);
  return NextResponse.json({ submission: row });
}
