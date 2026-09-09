import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById, publishSubmission } from "@/lib/db/queries/submissions";
import { getLatestIdeaScore, getLatestProductScore } from "@/lib/db/queries/scores";
import { computeFinalScore } from "@/lib/scoring";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const submission = await getSubmissionById(Number(id));
  if (!submission) {
    return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });
  }
  if (submission.securityStatus !== "clean") {
    return NextResponse.json({ error: "Chưa qua cổng rà soát an toàn (CP4)" }, { status: 409 });
  }
  if (!submission.facebookApprovedAt) {
    return NextResponse.json({ error: "Chưa duyệt bài đăng Facebook (CP5)" }, { status: 409 });
  }

  const ideaScore = await getLatestIdeaScore(submission.id);
  const productScore = await getLatestProductScore(submission.id);
  if (!ideaScore || !productScore) {
    return NextResponse.json({ error: "Chưa đủ điểm Phase 1/2 để công bố" }, { status: 409 });
  }

  const finalScore = computeFinalScore({
    technicalRaw: Number(productScore.moduleScores.chatLuongKyThuat ?? 0),
    isPrebuiltRepo: submission.isPrebuiltRepo,
    completion: Number(productScore.moduleScores.hoanThien ?? 0),
    applicationValue: Number(ideaScore.moduleScores.giaTriUngDung ?? 0),
    engagementTier: submission.engagementTier,
  });

  const row = await publishSubmission(submission.id, finalScore);
  return NextResponse.json({ submission: row });
}
