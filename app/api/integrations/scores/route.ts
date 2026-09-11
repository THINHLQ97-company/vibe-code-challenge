import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/integration-auth";
import { getSubmissionById } from "@/lib/db/queries/submissions";
import { addIdeaScore, addProductScore } from "@/lib/db/queries/scores";
import { validateModuleScores, modulesForPhase } from "@/lib/scoring-rubric";

export const dynamic = "force-dynamic";

/**
 * Công cụ chấm ngoài ĐẨY ĐIỂM về (app này không tự chấm — xem docs/API-CHAM-DIEM.md).
 *
 * Điểm ghi vào đây là điểm THAM CHIẾU, không phải điểm cuối: hội đồng vẫn chấm độc lập, và thí
 * sinh chỉ thấy điểm sau khi có phiếu giám khảo (xem lib/score-visibility.ts).
 */
const schema = z.object({
  submissionId: z.number().int(),
  phase: z.union([z.literal(1), z.literal(2)]),
  moduleScores: z.record(z.string(), z.number()),
  summary: z.string().max(4000).optional(),
});

export async function POST(req: NextRequest) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload không hợp lệ" },
      { status: 400 }
    );
  }
  const { submissionId, phase, moduleScores, summary } = parsed.data;

  const submission = await getSubmissionById(submissionId);
  if (!submission) {
    return NextResponse.json({ error: "submissionId không tồn tại" }, { status: 404 });
  }

  /**
   * Kiểm theo barem TRƯỚC khi ghi.
   *
   * Bản cũ nhận `Record<string, number>` tức mọi khoá đều hợp lệ. Công cụ gõ nhầm một ký tự là
   * điểm vẫn "ghi nhận thành công", rồi phần tổng hợp đọc đúng tên khoá không thấy gì nên trả 0 —
   * bài bị 0 điểm trong im lặng, và không ai có manh mối để lần ra.
   */
  const check = validateModuleScores(phase, moduleScores);
  if (!check.ok) {
    return NextResponse.json(
      { error: check.error, expected: modulesForPhase(phase) },
      { status: 422 }
    );
  }

  if (phase === 1) {
    const row = await addIdeaScore(submissionId, moduleScores, summary, "external_ai");
    return NextResponse.json({ ok: true, phase, ideaScore: row });
  }
  const row = await addProductScore(submissionId, moduleScores, summary, "external_ai");
  return NextResponse.json({ ok: true, phase, productScore: row });
}
