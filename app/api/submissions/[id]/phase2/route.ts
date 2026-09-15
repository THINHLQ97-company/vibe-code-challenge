import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById, updatePhase2Info } from "@/lib/db/queries/submissions";
import { getAggregatedScores } from "@/lib/db/queries/scores";

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

  const row = await updatePhase2Info(submission.id, parsed.data);
  return NextResponse.json({ submission: row });
}
