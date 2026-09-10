import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import {
  getSubmissionById,
  updatePhase2Info,
  markGithubVerified,
  markGithubVerifyFailed,
} from "@/lib/db/queries/submissions";
import { getAggregatedScores } from "@/lib/db/queries/scores";
import { verifyGithubAccess } from "@/lib/github";

const schema = z.object({
  vibehostUrl: z.string().url("Link Vibe Host không hợp lệ"),
  githubRepoUrl: z.string().url("Link GitHub không hợp lệ"),
});

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

  // Đã chấm Phase 2 thì khoá link: điểm chấm theo sản phẩm ở thời điểm chấm, đổi link sau đó là
  // điểm không còn khớp thứ được chấm. `needs_fix` là ngoại lệ — chính BTC yêu cầu nộp lại.
  const scored = await getAggregatedScores(submission.id);
  if (scored.hasProductScore && submission.feedbackStatus !== "needs_fix") {
    return NextResponse.json(
      { error: "BTC đã chấm Phase 2 — không đổi link được nữa. Chờ BTC yêu cầu chỉnh sửa nếu cần." },
      { status: 409 }
    );
  }

  await updatePhase2Info(submission.id, parsed.data);
  const verify = await verifyGithubAccess(parsed.data.githubRepoUrl);
  if (verify.ok) {
    const row = await markGithubVerified(submission.id);
    return NextResponse.json({ submission: row, githubVerified: true });
  }
  // Lưu lại lý do thất bại — phải sống sót qua reload để cả thí sinh lẫn BTC/BGK
  // đều thấy được tại sao bài đang kẹt ở Phase 2, không chỉ hiện tạm trên UI lúc bấm nút
  // (tham khảo pattern validation status của hackclub/podium).
  const row = await markGithubVerifyFailed(submission.id, verify.reason ?? "Không xác định được lỗi");
  return NextResponse.json({ submission: row, githubVerified: false, githubError: verify.reason });
}
