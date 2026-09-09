import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById, markSurveySubmitted } from "@/lib/db/queries/submissions";
import { upsertSurvey } from "@/lib/db/queries/surveys";

const schema = z.object({
  common: z.array(z.string().min(1)).length(6, "Cần trả lời đủ 6 câu chung"),
  boardSpecific: z.array(z.string().min(1)).length(4, "Cần trả lời đủ 4 câu riêng theo bảng"),
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

  await upsertSurvey(submission.id, parsed.data);
  const row = await markSurveySubmitted(submission.id);
  return NextResponse.json({ submission: row });
}
