import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getSubmissionWithUser } from "@/lib/db/queries/submissions";

/**
 * Hệ chấm điểm ngoài ĐỌC dữ liệu bài dự thi qua endpoint này rồi đẩy điểm về
 * `POST /api/integrations/scores`.
 *
 * Trước đây chỉ có chiều đẩy điểm VÀO mà không có chiều đọc RA — nghĩa là bộ chấm không có cách
 * nào lấy được tài liệu PRD để chấm Phase 1 ("chấm điểm ý tưởng bằng API kết nối database" theo
 * thể lệ). Không trả về thông tin cá nhân thí sinh: bộ chấm không cần biết ai viết bài nào.
 */
function validApiKey(header: string | null) {
  const expected = process.env.SCORING_API_KEY;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  // So sánh theo thời gian hằng định: `!==` thường trả lời sớm ở ký tự lệch đầu tiên, đủ để dò
  // dần từng ký tự của khoá qua thời gian phản hồi.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validApiKey(req.headers.get("x-api-key"))) {
    return NextResponse.json({ error: "API key không hợp lệ" }, { status: 401 });
  }

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
      // Phase 1 — chấm ý tưởng
      problemDesc: s.problemDesc,
      targetUsers: s.targetUsers,
      features: s.features,
      databasePlan: s.databasePlan,
      prd: s.prdContent,
      prdFileName: s.prdFileName,
      // Phase 2 — chấm sản phẩm
      vibehostUrl: s.vibehostUrl,
      githubRepoUrl: s.githubRepoUrl,
      githubVerified: !!s.githubVerifiedAt,
      hasWorkflow: s.hasWorkflow,
      workflowDesc: s.workflowDesc,
      isPrebuiltRepo: s.isPrebuiltRepo,
      // Trần điểm kỹ thuật để bộ chấm không trả về điểm vượt trần rồi bị cắt lặng lẽ.
      technicalCap: s.isPrebuiltRepo ? 20 : 40,
    },
  });
}
