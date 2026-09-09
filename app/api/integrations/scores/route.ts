import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getSubmissionById } from "@/lib/db/queries/submissions";
import { addIdeaScore, addProductScore } from "@/lib/db/queries/scores";

// Endpoint cho HỆ CHẤM ĐIỂM AI NGOÀI đẩy điểm về (không phải app này tự chấm) —
// xem docs/PRD.md mục 4/7. Auth bằng header X-API-Key so khớp SCORING_API_KEY.
// Payload/hợp đồng CHƯA CHỐT chính thức với đội build bộ chấm điểm — có thể cần
// điều chỉnh khi có đặc tả thật.
const schema = z.object({
  submissionId: z.number().int(),
  phase: z.union([z.literal(1), z.literal(2)]),
  moduleScores: z.record(z.string(), z.number()),
  summary: z.string().optional(),
});

/** So sánh theo thời gian hằng định — `!==` thường lộ dần khoá qua thời gian phản hồi. */
function validApiKey(header: string | null) {
  const expected = process.env.SCORING_API_KEY;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!validApiKey(req.headers.get("x-api-key"))) {
    return NextResponse.json({ error: "API key không hợp lệ" }, { status: 401 });
  }

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

  if (phase === 1) {
    const row = await addIdeaScore(submissionId, moduleScores, summary, "external_ai");
    return NextResponse.json({ ideaScore: row });
  }
  const row = await addProductScore(submissionId, moduleScores, summary, "external_ai");
  return NextResponse.json({ productScore: row });
}
