import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import {
  addIdeaScore,
  addProductScore,
  findJudgeIdeaScore,
  findJudgeProductScore,
  updateIdeaScore,
  updateProductScore,
  judgeSlotFor,
  MAX_JUDGES_PER_PHASE,
} from "@/lib/db/queries/scores";

// BTC/BGK tự nhập điểm khi CHƯA có hệ chấm điểm ngoài kết nối
// (xem docs/PRD.md mục 7 — integration point chưa chốt hợp đồng API chính thức).
// Điểm nhập ở đây đánh dấu source="judge" + judgeId để phân biệt với điểm đẩy tự động,
// và để `getAggregatedScores` lấy TRUNG BÌNH nhiều giám khảo theo thể lệ.
const schema = z.object({
  phase: z.union([z.literal(1), z.literal(2)]),
  moduleScores: z.record(z.string(), z.number().min(0).max(100)),
  summary: z.string().max(2000).optional(),
});

/** Kiểu hàm tra phiếu cũ của chính người đang chấm — hai phase khác bảng nhưng cùng dạng. */


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const submissionId = Number((await params).id);
  if (!Number.isInteger(submissionId)) {
    return NextResponse.json({ error: "Mã bài dự thi không hợp lệ" }, { status: 400 });
  }
  const judgeId = auth.session.userId;
  const { moduleScores, summary } = parsed.data;

  /**
   * Trần 2 giám khảo mỗi bài mỗi phase.
   *
   * Chặn Ở ĐÂY chứ không chỉ ẩn nút: ẩn nút chỉ là ẩn, ai gọi thẳng route này vẫn chấm được. Đây
   * cũng là chỗ xử lý hai giám khảo bấm cùng lúc khi còn một suất — người gửi tới trước được
   * nhận, người sau ăn lỗi rõ ràng thay vì cả hai cùng lọt.
   *
   * ADMIN không bị trần này: vai trò của admin là trọng tài, phải vào sửa được mọi lúc. Sửa phiếu
   * của người khác thì phiếu đổi chủ sang admin — xem `reassignBallotToAdmin`.
   */
  if (auth.session.role !== "admin") {
    const slot = await judgeSlotFor(submissionId, parsed.data.phase, judgeId);
    if (!slot.canScore) {
      /**
       * Hai lý do rất khác nhau, và người đọc cần biết mình đang gặp cái nào: bài đã đủ phiếu (hết
       * việc) hay bài được giao cho người khác (nhầm bài). Gộp thành một câu thì giám khảo bị chặn
       * vì nhầm bài sẽ ngồi chờ một suất không bao giờ mở ra.
       */
      return NextResponse.json(
        {
          error: slot.taken < MAX_JUDGES_PER_PHASE
            ? "Bài này được giao cho giám khảo khác. Nếu người đó vắng, ban tổ chức giao lại ở mục Phân công chấm."
            : `Thí sinh đã được chấm đủ ${MAX_JUDGES_PER_PHASE} phiếu.`,
        },
        { status: 409 }
      );
    }
  }

  // Một giám khảo = một phiếu. Chấm lại thì SỬA phiếu cũ, không đẻ thêm phiếu —
  // nếu không, người chấm đi chấm lại sẽ tự kéo lệch điểm trung bình của cả hội đồng.
  if (parsed.data.phase === 1) {
    const existing = await findJudgeIdeaScore(submissionId, judgeId);
    const row = existing
      ? await updateIdeaScore(existing.id, moduleScores, summary)
      : await addIdeaScore(submissionId, moduleScores, summary, "judge", judgeId);
    return NextResponse.json({ ideaScore: row });
  }

  const existing = await findJudgeProductScore(submissionId, judgeId);
  const row = existing
    ? await updateProductScore(existing.id, moduleScores, summary)
    : await addProductScore(submissionId, moduleScores, summary, "judge", judgeId);
  return NextResponse.json({ productScore: row });
}
