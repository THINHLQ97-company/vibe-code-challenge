import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById } from "@/lib/db/queries/submissions";
import { createAppeal, listAppealsForSubmission } from "@/lib/db/queries/appeals";
import { checkAppealGate } from "@/lib/appeal-policy";

const schema = z.object({
  criteria: z.string().min(3),
  evidenceUrl: z.string().url("Cần đính bằng chứng dạng link (commit/video/ảnh)"),
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

  // Cửa sổ 48h + một lần duy nhất — kiểm ở API chứ không chỉ ẩn nút trên UI.
  const existing = await listAppealsForSubmission(submission.id);
  const gate = checkAppealGate({
    publishedAt: submission.publishedAt,
    existingAppeals: existing.length,
  });
  if (!gate.open) {
    return NextResponse.json({ error: gate.reason }, { status: 409 });
  }

  const row = await createAppeal(submission.id, parsed.data.criteria, parsed.data.evidenceUrl);
  return NextResponse.json({ appeal: row });
}
