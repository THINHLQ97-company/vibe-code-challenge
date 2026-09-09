import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  getSubmissionById,
  markGithubVerified,
  markGithubVerifyFailed,
} from "@/lib/db/queries/submissions";
import { verifyGithubAccess } from "@/lib/github";

// Kiểm tra lại verify GitHub mà KHÔNG cần nhập lại link — thí sinh thường sửa quyền
// collaborator trên GitHub rồi quay lại bấm "kiểm tra lại" thay vì gõ lại cả form.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["candidate"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const submission = await getSubmissionById(Number(id));
  if (!submission || submission.userId !== auth.session.userId) {
    return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });
  }
  if (!submission.githubRepoUrl) {
    return NextResponse.json({ error: "Chưa có link GitHub để kiểm tra" }, { status: 400 });
  }

  const verify = await verifyGithubAccess(submission.githubRepoUrl);
  if (verify.ok) {
    const row = await markGithubVerified(submission.id);
    return NextResponse.json({ submission: row, githubVerified: true });
  }
  const row = await markGithubVerifyFailed(submission.id, verify.reason ?? "Không xác định được lỗi");
  return NextResponse.json({ submission: row, githubVerified: false, githubError: verify.reason });
}
