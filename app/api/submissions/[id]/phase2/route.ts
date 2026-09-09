import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById, updatePhase2Info, markGithubVerified } from "@/lib/db/queries/submissions";
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

  await updatePhase2Info(submission.id, parsed.data);
  const verify = await verifyGithubAccess(parsed.data.githubRepoUrl);
  if (verify.ok) {
    const row = await markGithubVerified(submission.id);
    return NextResponse.json({ submission: row, githubVerified: true });
  }
  return NextResponse.json({
    submission: await getSubmissionById(submission.id),
    githubVerified: false,
    githubError: verify.reason,
  });
}
