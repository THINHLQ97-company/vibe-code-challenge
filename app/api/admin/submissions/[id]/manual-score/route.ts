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
