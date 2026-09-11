import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/integration-auth";
import { getSubmissionWithUser } from "@/lib/db/queries/submissions";
import { RUBRIC } from "@/lib/scoring-rubric";

export const dynamic = "force-dynamic";

/**
 * Toàn bộ dữ liệu của MỘT bài để công cụ chấm ngoài chấm.
 *
 * KHÔNG trả thông tin cá nhân thí sinh (tên, email, mã nhân viên): công cụ chấm không cần biết ai
 * viết bài nào, và không biết thì cũng không thiên vị được.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Mã bài dự thi không hợp lệ" }, { status: 400 });
  }

  const s = await getSubmissionWithUser(id);
  if (!s) {
    return NextResponse.json({ error: "submissionId không tồn tại" }, { status: 404 });
  }

  return NextResponse.json({
    submission: {
      id: s.id,
      currentPhase: s.currentPhase,
      board: s.user.board,
      branch: s.branch,
      topicGroup: s.topicGroup,
      productName: s.productName,

      // ── Phase 1 — chấm ý tưởng ─────────────────────────────────────────────────────────
      // Các trường "Chức năng chính", "Phương án database", "Workflow tự động" đã NGƯNG thu thập
      // từ 10/09/2026 — chúng luôn rỗng nên trả về chỉ làm công cụ chấm tưởng thí sinh bỏ trống.
      // Toàn bộ phạm vi và chức năng nay nằm trong tài liệu PRD.
      problemDesc: s.problemDesc,
      targetUsers: s.targetUsers,
      prd: s.prdContent,
      prdFileName: s.prdFileName,

      // ── Phase 2 — chấm sản phẩm ────────────────────────────────────────────────────────
      vibehostUrl: s.vibehostUrl,
      githubRepoUrl: s.githubRepoUrl,
      githubVerified: !!s.githubVerifiedAt,
      flaggedPrebuiltRepo: s.isPrebuiltRepo,

      // ── Trạng thái cổng an toàn (CP4) ──────────────────────────────────────────────────
      securityStatus: s.securityStatus,
    },
    // Gửi kèm barem để công cụ chấm không phải gõ cứng trần điểm ở phía nó — đổi barem thì chỉ đổi
    // một chỗ trong app này.
    rubric: RUBRIC,
  });
}
